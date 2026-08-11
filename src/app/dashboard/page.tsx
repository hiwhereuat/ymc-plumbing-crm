"use client";

import { useEffect, useState, useCallback } from "react";
import { Job } from "@/types";
import { JobCard } from "@/components/JobCard";
import { EventLog } from "@/components/EventLog";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    const interval = setInterval(fetchJobs, 5000);

    return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleStatusChange = async (
    jobId: number,
    newStatus: string,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      const json = await res.json();
      if (json.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, ...json.job } : j))
        );
      } else {
        alert("Failed to update status: " + (json.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Update failed", error);
      alert("Network error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Job Dashboard</h2>
        <button
          onClick={() => window.open("/widget", "_blank")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create New Job
        </button>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No jobs yet. Create one from a lead.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-3">Activity Log</h3>
        <EventLog />
      </div>
    </div>
  );
}