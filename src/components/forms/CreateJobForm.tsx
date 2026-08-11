"use client";

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
}

export function CreateJobForm({ onSuccess, onCancel }: CreateJobFormProps) {
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
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      {/* Client Details */}
      <fieldset className="border p-4 rounded">
        <legend className="text-lg font-semibold">Client Details</legend>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium">First Name *</label>
            <input {...register("leadFirstName")} className="w-full border rounded p-2" />
            {errors.leadFirstName && <p className="text-red-500 text-sm">{errors.leadFirstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name *</label>
            <input {...register("leadLastName")} className="w-full border rounded p-2" />
            {errors.leadLastName && <p className="text-red-500 text-sm">{errors.leadLastName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Phone *</label>
            <input {...register("phone")} className="w-full border rounded p-2" />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input {...register("email")} className="w-full border rounded p-2" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Job Details */}
      <fieldset className="border p-4 rounded">
        <legend className="text-lg font-semibold">Job Details</legend>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium">Job Type *</label>
            <select {...register("jobType")} className="w-full border rounded p-2">
              <option value="">Select...</option>
              <option value="Pipe Leak">Pipe Leak</option>
              <option value="Drain Cleaning">Drain Cleaning</option>
              <option value="Water Heater">Water Heater</option>
              <option value="Emergency Repair">Emergency Repair</option>
              <option value="Inspection">Inspection</option>
            </select>
            {errors.jobType && <p className="text-red-500 text-sm">{errors.jobType.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Job Source *</label>
            <select {...register("jobSource")} className="w-full border rounded p-2">
              <option value="">Select...</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Website">Website</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
            </select>
            {errors.jobSource && <p className="text-red-500 text-sm">{errors.jobSource.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea {...register("description")} className="w-full border rounded p-2" rows={3} />
          </div>
        </div>
      </fieldset>

      {/* Service Location */}
      <fieldset className="border p-4 rounded">
        <legend className="text-lg font-semibold">Service Location</legend>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="col-span-2">
            <label className="block text-sm font-medium">Address *</label>
            <input {...register("address")} className="w-full border rounded p-2" />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">City *</label>
            <input {...register("city")} className="w-full border rounded p-2" />
            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">ZIP Code *</label>
            <input {...register("zip")} className="w-full border rounded p-2" />
            {errors.zip && <p className="text-red-500 text-sm">{errors.zip.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Area *</label>
            <input {...register("area")} className="w-full border rounded p-2" />
            {errors.area && <p className="text-red-500 text-sm">{errors.area.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Schedule */}
      <fieldset className="border p-4 rounded">
        <legend className="text-lg font-semibold">Schedule</legend>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium">Start Date *</label>
            <input type="date" {...register("scheduledDate")} className="w-full border rounded p-2" />
            {errors.scheduledDate && <p className="text-red-500 text-sm">{errors.scheduledDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Start Time *</label>
            <input type="time" {...register("startTime")} className="w-full border rounded p-2" />
            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">End Time *</label>
            <input type="time" {...register("endTime")} className="w-full border rounded p-2" />
            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Assigned Plumber *</label>
            <input {...register("plumber")} className="w-full border rounded p-2" placeholder="Plumber name" />
            {errors.plumber && <p className="text-red-500 text-sm">{errors.plumber.message}</p>}
          </div>
        </div>
      </fieldset>

      {serverError && <div className="text-red-600 bg-red-100 p-2 rounded">{serverError}</div>}
      {successMessage && <div className="text-green-600 bg-green-100 p-2 rounded">{successMessage}</div>}

      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" isLoading={isSubmitting}>
          Create Job
        </Button>
      </div>
    </form>
  );
}