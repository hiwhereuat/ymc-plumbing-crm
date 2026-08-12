import { Job } from "@/types";

const STATUS_FLOW: Record<string, string[]> = {
  "Job Created": ["Scheduled", "Lost / Cancelled"],
  Scheduled: ["In Progress", "Lost / Cancelled"],
  "In Progress": ["Completed", "Lost / Cancelled"],
  Completed: [],
  "Lost / Cancelled": [],
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  "Job Created": { bg: "#dbeafe", text: "#1d4ed8" },
  Scheduled: { bg: "#f3e8ff", text: "#7c3aed" },
  "In Progress": { bg: "#fef3c7", text: "#b45309" },
  Completed: { bg: "#d1fae5", text: "#047857" },
  "Lost / Cancelled": { bg: "#fee2e2", text: "#b91c1c" },
};

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: number, newStatus: string, reason?: string) => void;
}

export function JobCard({ job, onStatusChange }: JobCardProps) {
  const nextStatuses = STATUS_FLOW[job.status] || [];
  const statusStyle = STATUS_STYLES[job.status] || { bg: "#f1f5f9", text: "#475569" };

  const handleAction = (newStatus: string) => {
    if (newStatus === "Lost / Cancelled") {
      const reason = prompt("Reason for cancellation:");
      if (reason === null) return;
      onStatusChange(job.id, newStatus, reason);
    } else {
      onStatusChange(job.id, newStatus);
    }
  };

  return (
    <div style={{
      background: "white",
      borderRadius: "0.75rem",
      border: "1px solid #f1f5f9",
      padding: "1rem",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <h4 style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9375rem" }}>
            {job.leadFirstName} {job.leadLastName}
          </h4>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Job #{job.id}</p>
        </div>
        <span style={{
          background: statusStyle.bg,
          color: statusStyle.text,
          padding: "0.125rem 0.625rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}>
          {job.status}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.875rem", color: "#64748b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#94a3b8" }}>🔧</span>
          <span>{job.jobType} — {job.jobSource}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#94a3b8" }}>📍</span>
          <span>{job.address}, {job.city} {job.zip}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#94a3b8" }}>📅</span>
          <span>{job.scheduledDate} ⏰ {job.startTime}–{job.endTime}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#94a3b8" }}>👷</span>
          <span>{job.plumber}</span>
        </div>
      </div>

      {nextStatuses.length > 0 && (
        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {nextStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handleAction(status)}
              style={{
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: "0.5rem",
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {status} →
            </button>
          ))}
        </div>
      )}
    </div>
  );
}