import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobs, events } from "@/db/schema";
import { createJobSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createJobSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const insertResult = db
      .insert(jobs)
      .values({
        leadFirstName: data.leadFirstName,
        leadLastName: data.leadLastName,
        phone: data.phone,
        email: data.email || null,
        jobType: data.jobType,
        jobSource: data.jobSource,
        description: data.description || null,
        address: data.address,
        city: data.city,
        zip: data.zip,
        area: data.area,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        plumber: data.plumber,
        status: "Job Created",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .run();

    const jobId = insertResult.lastInsertRowid as number;

    db.insert(events)
      .values({
        jobId,
        type: "job_created",
        message: `Job created — ${data.leadFirstName} ${data.leadLastName} — ${data.jobType}`,
        createdAt: new Date().toISOString(),
      })
      .run();

    try {
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "job_created",
            jobId,
            ...data,
            status: "Job Created",
            callbackUrl: `${request.headers.get("origin")}/api/jobs/${jobId}`,
            }),
        });
        db.insert(events)
          .values({
            jobId,
            type: "slack_sheets_sent",
            message: "n8n webhook triggered successfully",
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

    const newJob = db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .get();


    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allJobs = db.select().from(jobs).all();
    return NextResponse.json({ success: true, jobs: allJobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}