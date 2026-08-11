export interface Job {
  id: number;
  leadFirstName: string;
  leadLastName: string;
  phone: string;
  email?: string;
  jobType: string;
  jobSource: string;
  description?: string;
  address: string;
  city: string;
  zip: string;
  area: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  plumber: string;
  status: string;
  sheetsRow?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  jobId?: number;
  type: string;
  message: string;
  createdAt: string;
}