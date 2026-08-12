import { Job } from "@/types";
import { Button } from "@/components/ui/Button";

const STATUS_FLOW: Record<string, string[]> = {
  "Job Created": ["Scheduled", "Lost / Cancelled"],
  Scheduled: ["In Progress", "Lost / Cancelled"],
  "In Progress": ["Completed", "Lost / Cancelled"],
  Completed: [],
  "Lost / Cancelled": [],
};

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: number, newStatus: string, reason?: string) => void;
}

export function JobCard({ job, onStatusChange }: JobCardProps) {
  const nextStatuses = STATUS_FLOW[job.status] || [];

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
    <div className="bg-white p-4 rounded shadow border">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold">
          {job.leadFirstName} {job.leadLastName}
        </h4>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {job.status}
        </span>
      </div>
      <p className="text-sm text-gray-600">{job.jobType} — {job.jobSource}</p>
      <p className="text-sm">{job.address}, {job.city} {job.zip}</p>
      <p className="text-sm">📅 {job.scheduledDate} ⏰ {job.startTime}-{job.endTime}</p>
      <p className="text-sm">👷 {job.plumber}</p>

      {nextStatuses.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {nextStatuses.map((status) => (
            <Button
              key={status}
              variant="primary"
              onClick={() => handleAction(status)}
              className="text-xs px-3 py-1"
            >
              {status}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}