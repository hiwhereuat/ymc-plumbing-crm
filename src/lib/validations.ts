import { z } from "zod";

export const createJobSchema = z.object({
  leadFirstName: z.string().min(1, "First name is required"),
  leadLastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  jobType: z.enum([
    "Pipe Leak",
    "Drain Cleaning",
    "Water Heater",
    "Emergency Repair",
    "Inspection",
  ]),
  jobSource: z.enum([
    "Phone Call",
    "Website",
    "Google Ads",
    "Referral",
    "Walk-in",
  ]),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(1, "ZIP code is required"),
  area: z.string().min(1, "Area is required"),
  scheduledDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  plumber: z.string().min(1, "Plumber is required"),
});

export const updateJobStatusSchema = z.object({
  status: z.enum([
    "Job Created",
    "Scheduled",
    "In Progress",
    "Completed",
    "Lost / Cancelled",
  ]),
  reason: z.string().optional(),
});