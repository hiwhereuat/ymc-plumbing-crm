import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pipelineId = searchParams.get("pipelineId");
  const statusId = searchParams.get("statusId");

  if (!pipelineId || !statusId) {
    return NextResponse.json({ success: false, error: "Missing pipelineId or statusId" }, { status: 400 });
  }

  const token = process.env.KOMMO_ACCESS_TOKEN;
  const base = process.env.KOMMO_BASE_URL;
  if (!token || !base) {
    return NextResponse.json({ success: false, error: "Kommo credentials not configured" }, { status: 500 });
  }

  const url = `${base}/api/v4/leads?filter[pipeline_id]=${pipelineId}&limit=100`;
  console.log(">>> Kommo GET leads URL:", url);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Kommo API returned ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    const allLeads = data._embedded?.leads || [];
    console.log(">>> All leads count:", allLeads.length);

    const targetStatusId = parseInt(statusId, 10);
    const filteredLeads = allLeads.filter((lead: any) => lead.status_id === targetStatusId);
    console.log(">>> Filtered leads count:", filteredLeads.length);

    return NextResponse.json({ success: true, leads: filteredLeads });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 });
  }
}