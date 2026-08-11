const KOMMO_BASE = process.env.KOMMO_BASE_URL || "";
const KOMMO_TOKEN = process.env.KOMMO_ACCESS_TOKEN || "";

export async function getDeals(pipelineId: number, statusId: number) {
  const url = `${KOMMO_BASE}/api/v4/leads?filter[pipeline_id]=${pipelineId}&filter[status_id]=${statusId}&limit=100`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KOMMO_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Kommo API error: ${res.status}`);
  const data = await res.json();
  return data._embedded?.leads || [];
}

export async function updateDealStage(dealId: number, statusId: number) {
  const res = await fetch(`${KOMMO_BASE}/api/v4/leads/${dealId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${KOMMO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status_id: statusId }),
  });
  if (!res.ok) throw new Error(`Kommo API error: ${res.status}`);
  return res.json();
}

export async function getPipelineStages(pipelineId: number) {
  const url = `${KOMMO_BASE}/api/v4/pipelines/${pipelineId}/statuses`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KOMMO_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Kommo API error: ${res.status}`);
  const data = await res.json();
  return data._embedded?.statuses || [];
}

export async function getDealContacts(dealId: number) {
  const url = `${KOMMO_BASE}/api/v4/leads/${dealId}?with=contacts`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KOMMO_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Kommo API error: ${res.status}`);
  const data = await res.json();
  const contacts = data._embedded?.contacts || [];
  if (contacts.length > 0) {
    const contact = contacts[0];
    const phone = contact.custom_fields_values?.find((f: any) => f.field_code === "PHONE")?.values?.[0]?.value || "";
    const email = contact.custom_fields_values?.find((f: any) => f.field_code === "EMAIL")?.values?.[0]?.value || "";
    const firstName = contact.first_name || "";
    const lastName = contact.last_name || "";
    return { firstName, lastName, phone, email };
  }
  return { firstName: "", lastName: "", phone: "", email: "" };
}