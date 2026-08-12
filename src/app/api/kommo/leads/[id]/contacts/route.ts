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
    const dealUrl = `${base}/api/v4/leads/${dealId}?with=contacts`;
    const dealRes = await fetch(dealUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!dealRes.ok) {
      return NextResponse.json({ success: false, error: `Kommo API returned ${dealRes.status}` }, { status: dealRes.status });
    }
    const dealData = await dealRes.json();
    const contacts = dealData._embedded?.contacts || [];
    if (contacts.length === 0) {
      return NextResponse.json({
        success: true,
        contacts: { firstName: "", lastName: "", phone: "", email: "" },
      });
    }

    const contactId = contacts[0].id;
    const contactUrl = `${base}/api/v4/contacts/${contactId}`;
    const contactRes = await fetch(contactUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!contactRes.ok) {
      return NextResponse.json({ success: false, error: `Failed to fetch contact details` }, { status: 500 });
    }
    const contactData = await contactRes.json();
    const firstName = contactData.first_name || "";
    const lastName = contactData.last_name || "";
    const customFields = contactData.custom_fields_values || [];
    let phone = "";
    let email = "";
    for (const field of customFields) {
      if (field.field_code === "PHONE" && field.values?.length > 0) {
        phone = field.values[0].value || "";
      }
      if (field.field_code === "EMAIL" && field.values?.length > 0) {
        email = field.values[0].value || "";
      }
    }
    return NextResponse.json({
      success: true,
      contacts: { firstName, lastName, phone, email },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to get contacts" }, { status: 500 });
  }
}