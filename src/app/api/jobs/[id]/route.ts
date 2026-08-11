import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, events } from "@/db/schema";
import { updateJobStatusSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { updateDealStage } from "@/lib/kommo";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateJobStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, reason } = validation.data;

    const existingJob = db.select().from(jobs).where(eq(jobs.id, jobId)).get();
    if (!existingJob) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    db.update(jobs)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(jobs.id, jobId))
      .run();

    db.insert(events)
      .values({
        jobId,
        type: "status_changed",
        message: `Status changed — ${status}${reason ? ` (Reason: ${reason})` : ""}`,
        createdAt: new Date().toISOString(),
      })
      .run();

    try {
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        const n8nPayload = {
          event: "status_changed",
          jobId,
          previousStatus: existingJob.status,
          newStatus: status,
          reason,
          leadFirstName: existingJob.leadFirstName,
          leadLastName: existingJob.leadLastName,
          phone: existingJob.phone,
          jobType: existingJob.jobType,
        };
        await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(n8nPayload),
        });
        db.insert(events)
          .values({
            jobId,
            type: "slack_sheets_sent",
            message: "n8n webhook for status change triggered",
            createdAt: new Date().toISOString(),
          })
          .run();
      }
    } catch (webhookError) {
      console.error("n8n webhook failed:", webhookError);
      db.insert(events)
        .values({
          jobId,
          type: "slack_sheets_failed",
          message: "Failed to trigger n8n webhook",
          createdAt: new Date().toISOString(),
        })
        .run();
    }

    let stageIds: Record<string, number> = {};
    try {
      const stageIdsRaw = process.env.KOMMO_STAGE_IDS;
      if (stageIdsRaw) {
        stageIds = JSON.parse(stageIdsRaw);
      }
    } catch (e) {
      console.error("Invalid KOMMO_STAGE_IDS JSON:", e);
    }

    if (existingJob.kommoDealId) {
      const targetStageId = stageIds[status];
      if (targetStageId) {
        try {
          await updateDealStage(existingJob.kommoDealId, targetStageId);
          db.insert(events)
            .values({
              jobId,
              type: "kommo_stage_updated",
              message: `Kommo deal moved to ${status}`,
              createdAt: new Date().toISOString(),
            })
            .run();
        } catch (e: any) {
          console.error("Failed to update Kommo stage:", e);
          db.insert(events)
            .values({
              jobId,
              type: "kommo_update_failed",
              message: "Failed to update deal stage in Kommo",
              createdAt: new Date().toISOString(),
            })
            .run();
        }
      }
    }

    const updatedJob = db.select().from(jobs).where(eq(jobs.id, jobId)).get();
    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}