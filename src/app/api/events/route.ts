import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobIdParam = searchParams.get("jobId");
    let allEvents;

    if (jobIdParam) {
      const jobId = parseInt(jobIdParam);
      allEvents = db
        .select()
        .from(events)
        .where(eq(events.jobId, jobId))
        .all();

    } else {
      allEvents = db.select().from(events).all();
    }

    return NextResponse.json({ success: true, events: allEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}