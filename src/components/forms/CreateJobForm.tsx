import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema } from "@/lib/validations";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type FormData = z.infer<typeof createJobSchema>;

interface CreateJobFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    leadFirstName?: string;
    leadLastName?: string;
    phone?: string;
    email?: string;
  };
  dealId?: number;
}

export function CreateJobForm({ onSuccess, onCancel, initialData, dealId }: CreateJobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      leadFirstName: initialData?.leadFirstName || "",
      leadLastName: initialData?.leadLastName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      jobType: undefined,
      jobSource: undefined,
      description: "",
      address: "",
      city: "",
      zip: "",
      area: "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      plumber: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const requestBody: any = { ...data };
      if (dealId) {
        requestBody.kommoDealId = dealId;
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errMsg = json.errors
          ? Object.values(json.errors).flat().join(", ")
          : json.error || "Failed to create job";
        throw new Error(errMsg);
      }

      setSuccessMessage("Job created successfully!");
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    padding: "0.625rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #e2e8f0",
    fontSize: "0.875rem",
    outline: "none",
    background: "#f8fafc",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#475569",
    marginBottom: "0.25rem",
  };

  const sectionStyle = {
    background: "#ffffff",
    borderRadius: "0.75rem",
    border: "1px solid #f1f5f9",
    padding: "1.25rem",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1e293b" }}>Create Job</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Client Details */}
      <fieldset style={sectionStyle}>
        <legend style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#334155", marginBottom: "0.75rem" }}>Client Details</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input {...register("leadFirstName")} style={fieldStyle} />
            {errors.leadFirstName && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.leadFirstName.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input {...register("leadLastName")} style={fieldStyle} />
            {errors.leadLastName && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.leadLastName.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Phone *</label>
            <input {...register("phone")} style={fieldStyle} />
            {errors.phone && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.phone.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input {...register("email")} style={fieldStyle} />
            {errors.email && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.email.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Job Details */}
      <fieldset style={sectionStyle}>
        <legend style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#334155", marginBottom: "0.75rem" }}>Job Details</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>Job Type *</label>
            <select {...register("jobType")} style={fieldStyle}>
              <option value="">Select...</option>
              <option value="Pipe Leak">Pipe Leak</option>
              <option value="Drain Cleaning">Drain Cleaning</option>
              <option value="Water Heater">Water Heater</option>
              <option value="Emergency Repair">Emergency Repair</option>
              <option value="Inspection">Inspection</option>
            </select>
            {errors.jobType && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.jobType.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Job Source *</label>
            <select {...register("jobSource")} style={fieldStyle}>
              <option value="">Select...</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Website">Website</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
            </select>
            {errors.jobSource && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.jobSource.message}</p>}
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Description</label>
            <textarea {...register("description")} style={{ ...fieldStyle, minHeight: "5rem", resize: "vertical" }} rows={3} />
          </div>
        </div>
      </fieldset>

      {/* Service Location */}
      <fieldset style={sectionStyle}>
        <legend style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#334155", marginBottom: "0.75rem" }}>Service Location</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Address *</label>
            <input {...register("address")} style={fieldStyle} />
            {errors.address && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.address.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>City *</label>
            <input {...register("city")} style={fieldStyle} />
            {errors.city && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.city.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>ZIP Code *</label>
            <input {...register("zip")} style={fieldStyle} />
            {errors.zip && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.zip.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Area *</label>
            <input {...register("area")} style={fieldStyle} />
            {errors.area && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.area.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Schedule */}
      <fieldset style={sectionStyle}>
        <legend style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#334155", marginBottom: "0.75rem" }}>Schedule</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>Start Date *</label>
            <input type="date" {...register("scheduledDate")} style={fieldStyle} />
            {errors.scheduledDate && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.scheduledDate.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Start Time *</label>
            <input type="time" {...register("startTime")} style={fieldStyle} />
            {errors.startTime && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.startTime.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>End Time *</label>
            <input type="time" {...register("endTime")} style={fieldStyle} />
            {errors.endTime && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.endTime.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Assigned Plumber *</label>
            <input {...register("plumber")} style={fieldStyle} placeholder="Plumber name" />
            {errors.plumber && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.plumber.message}</p>}
          </div>
        </div>
      </fieldset>

      {serverError && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
          {serverError}
        </div>
      )}
      {successMessage && (
        <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
          {successMessage}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" }}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" isLoading={isSubmitting}>
          Create Job
        </Button>
      </div>
    </form>
  );
}