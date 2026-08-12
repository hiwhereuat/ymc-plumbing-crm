"use client";
import { useEffect, useState, useCallback } from "react";
import { CreateJobForm } from "@/components/forms/CreateJobForm";
import { Job } from "@/types";
import { JobCard } from "@/components/JobCard";
import { EventLog } from "@/components/EventLog";

const PIPELINE_ID = parseInt(process.env.NEXT_PUBLIC_KOMMO_PIPELINE_ID || "", 10);
const NEW_LEAD_STAGE_ID = parseInt(process.env.NEXT_PUBLIC_NEW_LEAD_STAGE_ID || "", 10);
const JOB_CREATED_STAGE_ID = parseInt(process.env.NEXT_PUBLIC_JOB_CREATED_STAGE_ID || "", 10);

interface Deal {
  id: number;
  name: string;
}

export default function WidgetPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "dashboard">("leads");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const loadDeals = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/kommo/leads?pipelineId=${PIPELINE_ID}&statusId=${NEW_LEAD_STAGE_ID}`
      );
      const data = await res.json();
      if (data.success) setDeals(data.leads);
    } catch (error) {
      console.error("Failed to load deals:", error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        const sorted = data.jobs.sort((a: Job, b: Job) => b.id - a.id);
        setJobs(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals();
    fetchJobs();
    const interval = setInterval(() => {
      loadDeals();
      fetchJobs();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadDeals, fetchJobs]);

  const handleCreateJob = async (deal: Deal) => {
    setSelectedDeal(deal);
    try {
      const res = await fetch(`/api/kommo/leads/${deal.id}/contacts`);
      const data = await res.json();
      if (data.success && data.contacts) {
        setInitialFormData({
          leadFirstName: data.contacts.firstName || deal.name.split(" ")[0] || "",
          leadLastName: data.contacts.lastName || deal.name.split(" ")[1] || "",
          phone: data.contacts.phone || "",
          email: data.contacts.email || "",
        });
      }
    } catch (error) {
      console.error("Failed to get contacts", error);
    }
  };

  const handleJobCreated = async () => {
    if (selectedDeal) {
      await fetch(`/api/kommo/leads/${selectedDeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId: JOB_CREATED_STAGE_ID }),
      });
      setDeals((prev) => prev.filter((d) => d.id !== selectedDeal.id));
    }
    setSelectedDeal(null);
    setInitialFormData(null);
    fetchJobs();
    setActiveTab("dashboard");
  };

  const handleStatusChange = async (jobId: number, newStatus: string, reason?: string) => {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, reason }),
    });
    fetchJobs();
  };

  const filteredJobs = showActiveOnly
    ? jobs.filter((j) => j.status !== "Completed" && j.status !== "Lost / Cancelled")
    : jobs;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "leads" ? "tab-active bg-white" : "tab-inactive"
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "dashboard" ? "tab-active bg-white" : "tab-inactive"
          }`}
        >
          Dashboard
        </button>
      </div>

      {activeTab === "leads" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-slate-800">New Leads from Kommo</h2>
          {deals.length === 0 ? (
            <div className="card p-6 text-center text-slate-400">
              <p className="text-lg mb-1">No new leads</p>
              <p className="text-sm">New leads from Kommo will appear here</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {deals.map((deal) => (
                <li key={deal.id} className="card p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{deal.name}</p>
                    <p className="text-xs text-slate-400">New Lead</p>
                  </div>
                  <button
                    onClick={() => handleCreateJob(deal)}
                    className="btn-primary text-xs"
                  >
                    + Create Job
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "dashboard" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="text-lg font-semibold text-slate-800">All Jobs</h2>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#64748b", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                style={{ width: "1rem", height: "1rem", accentColor: "#3b82f6" }}
              />
              Active only
            </label>
          </div>

          {loading ? (
            <div className="card p-6 text-center">
              <div style={{ color: "#94a3b8" }}>Loading jobs...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="card p-6 text-center text-slate-400">
              <p className="text-lg mb-1">
                {showActiveOnly ? "No active jobs" : "No jobs yet"}
              </p>
              <p className="text-sm">Create a job from the Leads tab</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 mb-8">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
          <EventLog />
        </div>
      )}

      {selectedDeal && initialFormData && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "1rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "1rem",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            width: "100%",
            maxWidth: "896px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
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