import { z } from "zod";

export const createJobSchema = z.object({
  leadFirstName: z.string().min(1, "First name is required"),
  leadLastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  jobType: z.enum(
    ["Pipe Leak", "Drain Cleaning", "Water Heater", "Emergency Repair", "Inspection"],
    { message: "Job type is required" }
  ),
  jobSource: z.enum(
    ["Phone Call", "Website", "Google Ads", "Referral", "Walk-in"],
    { message: "Job source is required" }
  ),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(1, "ZIP code is required"),
  area: z.string().min(1, "Area is required"),
  scheduledDate: z.string().min(1, "Date is required").refine(
    (val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: "Date cannot be in the past" }
  ).refine(
    (val) => {
      const year = new Date(val).getFullYear();
      const maxYear = new Date().getFullYear() + 5;
      return year <= maxYear;
    },
    { message: "Date is too far in the future" }
  ),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  plumber: z.string().min(1, "Plumber is required"),
  kommoDealId: z.number().int().positive().optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return data.startTime < data.endTime;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const updateJobStatusSchema = z.object({
  status: z.enum([
    "Job Created",
    "Scheduled",
    "In Progress",
    "Completed",
    "Lost / Cancelled",
  ]),
  reason: z.string().optional(),
  sheetsRow: z.number().int().positive().optional(),
});