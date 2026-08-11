import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadFirstName: text("lead_first_name").notNull(),
  leadLastName: text("lead_last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  jobType: text("job_type").notNull(),
  jobSource: text("job_source").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  zip: text("zip").notNull(),
  area: text("area").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  plumber: text("plumber").notNull(),
  status: text("status").notNull().default("Job Created"),
  sheetsRow: integer("sheets_row"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});