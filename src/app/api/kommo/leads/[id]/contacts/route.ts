import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dealId = parseInt(id);
  if (isNaN(dealId)) {
    return NextResponse.json({ success: false, error: "Invalid deal ID" }, { status: 400 });
  }

  const token = process.env.KOMMO_ACCESS_TOKEN;
  const base = process.env.KOMMO_BASE_URL;
  if (!token || !base) {
    return NextResponse.json({ success: false, error: "Kommo credentials not configured" }, { status: 500 });
  }

  try {
    const url = `${base}/api/v4/leads/${dealId}?with=contacts`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Kommo API returned ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    const contacts = data._embedded?.contacts || [];
    let firstName = "";
    let lastName = "";
    let phone = "";
    let email = "";
    if (contacts.length > 0) {
      const contact = contacts[0];
      firstName = contact.first_name || "";
      lastName = contact.last_name || "";
      phone = contact.custom_fields_values?.find((f: any) => f.field_code === "PHONE")?.values?.[0]?.value || "";
      email = contact.custom_fields_values?.find((f: any) => f.field_code === "EMAIL")?.values?.[0]?.value || "";
    }
    return NextResponse.json({
      success: true,
      contacts: { firstName, lastName, phone, email },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to get contacts" }, { status: 500 });
  }
}