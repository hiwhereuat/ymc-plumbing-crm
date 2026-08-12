"use client";
import { useEffect, useState, useCallback } from "react";
import { CreateJobForm } from "@/components/forms/CreateJobForm";

const PIPELINE_ID = parseInt(process.env.NEXT_PUBLIC_KOMMO_PIPELINE_ID || "", 10);
const NEW_LEAD_STAGE_ID = parseInt(process.env.NEXT_PUBLIC_NEW_LEAD_STAGE_ID || "", 10);
const JOB_CREATED_STAGE_ID = parseInt(process.env.NEXT_PUBLIC_JOB_CREATED_STAGE_ID || "", 10);

interface Deal {
  id: number;
  name: string;
}

export default function WidgetPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  const loadDeals = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/kommo/leads?pipelineId=${PIPELINE_ID}&statusId=${NEW_LEAD_STAGE_ID}`
      );
      const data = await res.json();
      if (data.success) {
        setDeals(data.leads);
      } else {
        console.error("Failed to load deals:", data.error);
      }
    } catch (error) {
      console.error("Failed to load Kommo deals:", error);
    }
  }, []);

  useEffect(() => {
    loadDeals();
    const interval = setInterval(loadDeals, 10000);
    return () => clearInterval(interval);
  }, [loadDeals]);

  const handleCreateJob = async (deal: Deal) => {
  setSelectedDeal(deal);
  try {
    const res = await fetch(`/api/kommo/leads/${deal.id}/contacts`);
    const data = await res.json();
    if (data.success && data.contacts) {
      setInitialFormData({
        leadFirstName:
          data.contacts.firstName ||
          deal.name.split(" ")[0] ||
          "",
        leadLastName:
          data.contacts.lastName ||
          deal.name.split(" ")[1] ||
          "",
        phone: data.contacts.phone || "",
        email: data.contacts.email || "",
      });
    } else {
      setInitialFormData({
        leadFirstName: deal.name.split(" ")[0] || "",
        leadLastName: deal.name.split(" ")[1] || "",
        phone: "",
        email: "",
      });
    }
  } catch (error) {
    console.error("Failed to get contacts", error);
    setInitialFormData({
      leadFirstName: deal.name.split(" ")[0] || "",
      leadLastName: deal.name.split(" ")[1] || "",
      phone: "",
      email: "",
    });
  }
};

  const handleJobCreated = async () => {
    if (selectedDeal) {
      try {
        const res = await fetch(`/api/kommo/leads/${selectedDeal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusId: JOB_CREATED_STAGE_ID }),
        });
        if (res.ok) {
          setDeals((prev) => prev.filter((d) => d.id !== selectedDeal.id));
          setTimeout(() => loadDeals(), 1000);
        } else {
          const err = await res.json();
          console.error("Move failed", err);
        }
      } catch (error) {
        console.error("Failed to move deal in Kommo:", error);
      }
    }
    setSelectedDeal(null);
    setInitialFormData(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">New Leads</h2>
      {deals.length === 0 ? (
        <p className="text-gray-500">No new leads.</p>
      ) : (
        <ul className="space-y-3">
          {deals.map((deal) => (
            <li key={deal.id} className="border rounded p-3 flex justify-between items-center">
              <span>{deal.name}</span>
              <button
                onClick={() => handleCreateJob(deal)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Create a job
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedDeal && initialFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateJobForm
              onSuccess={handleJobCreated}
              onCancel={() => {
                setSelectedDeal(null);
                setInitialFormData(null);
              }}
              initialData={initialFormData}
              dealId={selectedDeal.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}