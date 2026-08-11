import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dealId = parseInt(id);
  if (isNaN(dealId)) {
    return NextResponse.json({ success: false, error: "Invalid deal ID" }, { status: 400 });
  }

  const body = await request.json();
  const { statusId } = body;
  if (!statusId) {
    return NextResponse.json({ success: false, error: "Missing statusId" }, { status: 400 });
  }

  const token = process.env.KOMMO_ACCESS_TOKEN;
  const base = process.env.KOMMO_BASE_URL;
  if (!token || !base) {
    return NextResponse.json({ success: false, error: "Kommo credentials not configured" }, { status: 500 });
  }

  console.log(">>> PATCH deal", dealId, "to statusId", statusId);  // ← логируем

  try {
    const res = await fetch(`${base}/api/v4/leads/${dealId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_id: statusId }),
    });
    console.log(">>> Kommo PATCH response status:", res.status); 
    if (!res.ok) {
      const err = await res.json();
      console.log(">>> Kommo PATCH error body:", err);
      return NextResponse.json({ success: false, error: `Kommo API returned ${res.status}` }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update deal" }, { status: 500 });
  }
}