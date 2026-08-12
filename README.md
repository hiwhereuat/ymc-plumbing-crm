# YMC Plumbing – Lead-to-Job Automation

A web application for YMC Plumbing that transforms leads into jobs, tracks their statuses, and automates notifications via Slack, Google Sheets, and Email. Integrated with Kommo CRM as a dashboard widget, powered by self-hosted n8n workflows.

## What This Project Does

This application solves a real business problem: a plumbing company receives leads from multiple sources, needs to convert them into scheduled jobs, track their progress, and keep the team informed. Instead of doing everything manually, the manager now:

1. Sees new leads from Kommo CRM in a widget
2. Creates a job with one click (form auto-filled with lead data)
3. The job appears in the dashboard with real-time status updates
4. Automations trigger instantly: Slack notifications, Google Sheets records, and client emails

## Tech Stack

- **Frontend & Backend:** Next.js 16 (App Router), React, TypeScript
- **Styling:** Tailwind CSS with custom components
- **Database:** SQLite with Drizzle ORM
- **Form Validation:** React Hook Form + Zod
- **Automation:** Self-hosted n8n (Docker)
- **CRM:** Kommo CRM (dashboard widget + API integration)
- **Integrations:** Slack API, Google Sheets API, Gmail SMTP

## How to Run Locally

### Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for n8n)
- Kommo CRM account (free trial works)
- Slack workspace with bot token
- Google Cloud project with Sheets API enabled
- Gmail account with app password (for email notifications)

### Step 1: Clone and Install

    git clone <your-repo-url>
    cd ymc-plumbing-crm
    npm install

### Step 2: Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

    cp .env.example .env.local

Required variables:

| Variable | Description |
|----------|-------------|
| `N8N_WEBHOOK_URL` | n8n production webhook URL (after workflow activation) |
| `KOMMO_ACCESS_TOKEN` | Long-lived token from Kommo (Settings → Integrations → API access) |
| `KOMMO_BASE_URL` | Your Kommo domain (e.g., `https://mycompany.kommo.com`) |
| `KOMMO_PIPELINE_ID` | Pipeline ID from Kommo URL |
| `KOMMO_STAGE_IDS` | JSON mapping of status names to stage IDs, example: `{"New Lead":110198159,"Job Created":110198163,"Scheduled":110198167,"In Progress":110198619,"Completed":110198623,"Lost / Cancelled":110198627}` |
| `NEXT_PUBLIC_KOMMO_PIPELINE_ID` | Same as `KOMMO_PIPELINE_ID` (for client-side) |
| `NEXT_PUBLIC_NEW_LEAD_STAGE_ID` | New Lead stage ID |
| `NEXT_PUBLIC_JOB_CREATED_STAGE_ID` | Job Created stage ID |

### Step 3: Start the Next.js App

    npm run dev

The app will be available at `http://localhost:3000`.

### Step 4: Run n8n with Docker

    cd n8n
    docker compose up -d

n8n will be available at `http://localhost:5678`.

### Step 5: Expose Local Server (for Kommo Widget)

Use Cloudflare Tunnel to make your local app accessible via HTTPS:

    cloudflared tunnel --url http://localhost:3000

Copy the generated URL (e.g., `https://something.trycloudflare.com`) and add it to `next.config.ts` in the `allowedDevOrigins` array:

    const nextConfig: NextConfig = {
      allowedDevOrigins: [
        'something.trycloudflare.com',
      ],
      devIndicators: false,
    };

### Step 6: Set Up Kommo Integration

1. Create a pipeline called "YMC Plumbing" with stages: New Lead, Job Created, Scheduled, In Progress, Completed, Lost / Cancelled
2. Go to Settings → Integrations → Create integration → Widget
3. Set the Widget URL to your Cloudflare Tunnel URL + `/widget`
4. Place the widget on the Dashboard (recommended size: 6 blocks wide, 3 blocks high)
5. Create a long-lived API token with deals read/write permissions

### Step 7: Configure n8n Workflow

1. Open `http://localhost:5678` in your browser
2. Import the workflow from `n8n-workflows/ymc-plumbing-automation.json`
3. Set up credentials:
   - **Slack:** Create a Slack app with Bot Token (scopes: `chat:write`)
   - **Google Sheets:** Create a Google Cloud service account, download JSON key, share your spreadsheet with the service account email
   - **SMTP:** Use Gmail with app password (host: `smtp.gmail.com`, port: `587`)
4. Replace placeholder URLs in the workflow nodes (Google Sheet ID, Slack channel URL)
5. Activate the workflow to get the production webhook URL
6. Copy the webhook URL and set it as `N8N_WEBHOOK_URL` in `.env.local`
7. Restart the Next.js app

## How the Lead-to-Job Flow Works

### 1. Lead Creation in Kommo

A new deal is created in the YMC Plumbing pipeline, initially in the "New Lead" stage. The deal can include contact information (name, phone, email).

### 2. Viewing Leads in the Widget

The application widget (embedded in Kommo Dashboard) shows all deals in the "New Lead" stage. It fetches this data via the Kommo API through our Next.js proxy routes (`/api/kommo/leads`).

### 3. Creating a Job from a Lead

- Click "Create a job" on any lead card
- The app fetches the lead's contact details (name, phone, email) from Kommo
- A pre-filled form opens with required fields:
  - **Client Details:** first name, last name, phone, email
  - **Job Details:** job type, job source, description
  - **Service Location:** address, city, ZIP code, area
  - **Schedule:** date, start time, end time, assigned plumber
- Form validation via Zod ensures all data is correct
- On submit, the job is saved to SQLite with the Kommo deal ID
- The deal in Kommo is moved to "Job Created" stage

### 4. Automation Triggers

When a job is created:
- **Slack:** Full job details sent to the team channel
- **Google Sheets:** New row appended with all job fields
- **Email:** Client receives a confirmation email

### 5. Job Status Management

The Dashboard tab shows all jobs sorted by newest first. Each job card displays:
- Client name, job type, address, schedule, plumber
- Current status badge with color coding
- Available next statuses as action buttons

Status flow: Job Created → Scheduled → In Progress → Completed (or Lost / Cancelled at any point)

### 6. Status Change Automation

When a job status changes:
- **Slack:** Update notification with old and new status
- **Google Sheets:** The existing row is updated (searched by Job ID), only Status and Reason columns change
- **Email:** Client notified of status change
- **Kommo:** The linked deal moves to the corresponding pipeline stage
- **Activity Log:** All events recorded in the app's event log

### 7. Additional Features

- **Active Only Filter:** Checkbox to hide completed and cancelled jobs
- **Auto-refresh:** Dashboard and activity log update every 10 seconds
- **Auto-scroll:** Activity log automatically scrolls to newest events

## How the Automation Part Works

### Architecture

The automation is handled by a self-hosted n8n instance running in Docker. The Next.js backend sends HTTP requests to an n8n webhook whenever a job is created or its status changes.

### Webhook Flow

1. Next.js `POST /api/jobs` and `PATCH /api/jobs/[id]` endpoints send data to n8n
2. n8n receives the request with event type (`job_created` or `status_changed`) and job data
3. A Switch node routes to different branches based on event type

### Job Created Branch

- Slack node: Sends a detailed message with client info, job type, address, schedule
- Google Sheets node: Appends a new row with all fields
- SMTP Email node: Sends confirmation to the client

### Status Changed Branch

- Slack node: Sends a status update notification
- Google Sheets node: Updates the existing row (matches by Job ID column), modifies only Status and Reason columns
- SMTP Email node: Sends status change notification to the client

### Kommo Integration

The app uses Kommo's REST API v4 for:
- Fetching deals by pipeline and status (`GET /api/v4/leads`)
- Moving deals between stages (`PATCH /api/v4/leads/{id}`)
- Fetching contact details for a deal (`GET /api/v4/leads/{id}/contacts`, `GET /api/v4/contacts/{id}`)

All Kommo API calls are proxied through Next.js API routes to keep the access token server-side only.

## AI Tools Usage

Parts of this project were developed with assistance from DeepSeek AI:

- Initial project scaffolding
- API error handling
- Debugging and troubleshooting