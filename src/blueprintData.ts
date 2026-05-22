export interface BlueprintSection {
  id: string;
  title: string;
  icon: string;
  category: "Strategic" | "Technical" | "Operations";
  summary: string;
  markdownContent: string;
}

export const blueprintSections: BlueprintSection[] = [
  {
    id: "product-vision",
    title: "1. Product Vision",
    icon: "Target",
    category: "Strategic",
    summary: "Establish a unified financial command center for mid-market CFO consultations.",
    markdownContent: `
### Strategic Framework
The **CFO Operations Hub** transforms fragmented spreadsheet processes into a **highly compliant, centralized operations platform**. For a firm servicing manufacturing, hotel operations, and high-worth personal portfolios, the tool bridges the gap between expert consultation and meticulous compliance.

### Executive Objectives:
*   **Operational Integrity**: Zero missed filing dates, regulatory milestones, or banking requests.
*   **Scale Without Headcount**: Enable the 4-team member consulting group to manage a client load of up to 40 complex corporate operations.
*   **Intelligent Differentiation**: Elevate user engagements through automated AI-powered strategic EBITDA audits, working capital analysis, and prompt client reports.
`
  },
  {
    id: "core-features",
    title: "2. Core Features",
    icon: "Compass",
    category: "Strategic",
    summary: "Key tactical features designed to eliminate work slippage and follow-up overhead.",
    markdownContent: `
### Core Functional Pillars
*   **State-driven CRM & Pipelines**: Track incoming corporate enquiries through stages (Enquiry ➔ Meeting ➔ Proposal Created ➔ Converted).
*   **Client Registry Master**: Store verified permanent records including GSTIN, PAN, multiple contact roles (MD, Accounts Lead, Auditor), and contract lifecycles.
*   **Automated Stage Workflows**: View and trace tasks through state matrices (Pending, In Progress, Under Review, Completed) with automatic daily progress logs.
*   **Accountability Timers & remiND**: Scheduled tracking of client actions (upload invoices) and partner actions (GST confirmations, banking loan sanctions).
*   **Integrated Doc Vault**: Folder mappings for tax registrations, historical records, and audits with expiration security flags.
`
  },
  {
    id: "user-roles",
    title: "3. User Roles & Permission Matrices",
    icon: "ShieldAlert",
    category: "Operations",
    summary: "Configuring roles for standard team members, partners, and external guests.",
    markdownContent: `
### Granular Access Control
A secure operations hierarchy keeps sensitive financial balances safe from accidental access or external exposure:

1.  **CFO Partner (Owner/Admin)**:
    *   Full administrative privileges across billing, client records, and advisory parameters.
    *   Authority to sign off on invoices, adjust custom billing retainers, and edit secure folders.
2.  **Senior Associate (Primary Consultant)**:
    *   Assign tasks, create client records, review compliance filings, and generate advisory memos.
    *   Read access to billing ledger metrics (write authorization excluded).
3.  **Compliance Analyst (Team Member)**:
    *   Execute recurring monthly GST, professional tax, and payroll compliance.
    *   Log daily progress, update task boards, and attach finished tax files.
4.  **Client Portal Guest (Viewer/Uploader)**:
    *   Direct read access to current task statuses, historical filing records, and secure document vaults.
    *   Secure upload folder access for recurring monthly source documents.
`
  },
  {
    id: "app-modules",
    title: "4. Modular Application Architecture",
    icon: "Layers",
    category: "Technical",
    summary: "Structured layout of the eight business control systems.",
    markdownContent: `
### Module Breakdown & Workflow Paths:
1.  **Lead Capture & Evaluation**: Handles enquiries, estimates project values, tracks proposal follow-ups, and facilitates client conversions.
2.  **Corporate Master Record**: Serves as the golden record for corporate entities. Captures GST, PAN, primary contacts, and historical onboarding timelines.
3.  **The Engine (Project & Task Board)**: Models project tracking with states, priority indicators, due schedules, and recurrences.
4.  **The Follow-up Control Room**: Decouples outstanding communication workflows with distinct modules for clients and external service partners (e.g., banks, tax lawyers).
5.  **DMS Vault**: Structural vault organizing items by business context rather than raw directory trees, with notification-based document expiry warnings.
6.  **Team Balance**: Tracks ongoing workload distribution, active assignments, and hours logged per project.
7.  **Billing & Profitability**: Generates recurring flat-retainer invoices and calculates hours spent versus retainer values to determine client margins.
8.  **Management Dashboard**: Synthesizes cross-system data points into a central strategic control room.
`
  },
  {
    id: "database-tables",
    title: "5. Relational Database Tables Schema",
    icon: "Database",
    category: "Technical",
    summary: "Rigorously defined tables, fields, relations, and index layouts for SQL storage.",
    markdownContent: `
### Recommended Database Schema
A normalized relational structure designed for transactional consistency (e.g., PostgreSQL or GCP Cloud SQL).

#### Table: \`users\`
| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique User ID |
| \`email\` | VARCHAR(255) | UNIQUE, NOT NULL | Corporate login email |
| \`name\` | VARCHAR(100) | NOT NULL | User's full name |
| \`role\` | VARCHAR(50) | NOT NULL | Partner, Senior Associate, Analyst |
| \`status\` | VARCHAR(20) | DEFAULT 'active' | active, deactivated |
| \`created_at\` | TIMESTAMP | DEFAULT NOW() | Record creation date |

#### Table: \`clients\`
| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | UUID | PRIMARY KEY | Golden Client ID |
| \`company_name\` | VARCHAR(255) | NOT NULL | Registered operating name |
| \`industry\` | VARCHAR(100) | NOT NULL | Manufacturing, Hotel/Resort, Private FP |
| \`pan\` | VARCHAR(10) | UNIQUE, NOT NULL | Permanent Account Number |
| \`gst\` | VARCHAR(15) | UNIQUE, NOT NULL | GST Registration Number |
| \`address\` | TEXT | | Registered office details |
| \`remarks\` | TEXT | | Core advisory notes |
| \`created_by\` | UUID | REFERENCES users(id) | Partner in charge |

#### Table: \`client_contacts\`
| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | UUID | PRIMARY KEY | Contact record sequence |
| \`client_id\` | UUID | REFERENCES clients(id) ON DELETE CASCADE | Associated corporate client |
| \`name\` | VARCHAR(100) | NOT NULL | Contact name |
| \`role\` | VARCHAR(100) | NOT NULL | MD, CFO, Accountant, Auditor |
| \`email\` | VARCHAR(255) | | Contact email address |
| \`phone\` | VARCHAR(15) | | Contact phone number |

#### Table: \`tasks\`
| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | UUID | PRIMARY KEY | Task sequence key |
| \`client_id\` | UUID | REFERENCES clients(id) | Target corporate task |
| \`title\` | VARCHAR(255) | NOT NULL | Task identifier |
| \`stage\` | VARCHAR(50) | DEFAULT 'Pending' | Pending, In Progress, Under Review, Completed |
| \`priority\` | VARCHAR(20) | DEFAULT 'Medium' | Low, Medium, High, Critical |
| \`assigned_to\` | UUID | REFERENCES users(id) | Team owner |
| \`due_date\` | DATE | NOT NULL | Deadline |
| \`recurrence\` | VARCHAR(20) | DEFAULT 'None' | Monthly Compliance, Quarterly Finance, Yearly, None |

### Key Optimization Indexes
*   \u26A1 \`CREATE INDEX idx_tasks_stage_due ON tasks (stage, due_date);\` — Optimizes the management dashboard's critical warnings query.
*   \u26A1 \`CREATE INDEX idx_clients_industry ON clients (industry);\` — Optimizes industry-specific filter processing on corporate masters.
`
  },
  {
    id: "recommended-tech-stack",
    title: "6. Recommended Tech Stack",
    icon: "Cpu",
    category: "Technical",
    summary: "Production-ready tools securing lightning fast performance and high-reliability.",
    markdownContent: `
### Recommended Production Architecture
*   **Front-End Platform**: React with Vite, styled with Tailwind CSS CSS framework. Supports reactive single-page app designs with rapid responsive rendering.
*   **Backend Server**: Node.js utilizing Express and TypeScript. Ensures consistent type schemas across clients and servers.
*   **ORM Layer**: Prisma ORM, producing fully typed database clients and managing SQL schema migrations.
*   **Primary Database**: PostgreSQL, hosted on Amazon RDS or Google Cloud SQL. Provides multi-zone replication, strict atomic compliance, and rapid JSON querying capabilities.
*   **Document Cache**: Redis for temporary session management and rate limiting API queries.
*   **Cloud Storage**: Google Cloud Storage or AWS S3 securely managed through restricted pre-signed URL configurations.
`
  },
  {
    id: "system-architecture",
    title: "7. System Architecture Design",
    icon: "Network",
    category: "Technical",
    summary: "Conceptual mapping of service layers, integrations, and database proxy components.",
    markdownContent: `
### Complete Architectural Schema
Our target deployment strategy uses a secure, decoupled tiered structure:

\`\`\`
                                  +------------------------+
                                  |   DNS / CDN Layer      |
                                  |  (Cloudflare / Gateway)|
                                  +-----------+------------+
                                              |
                                              v  [TLS 1.3 Secure Entry]
                                  +-----------+------------+
                                  |    Express Server      |
                                  |   (Proxy & API Serv)   |
                                  +-----+-----+-----+------+
                                        |     |     |
          +-----------------------------+     |     +-----------------------------+
          |                                   |                                   |
          v                                   v                                   v
+---------+--------------+       +------------+-----------+       +---------------+--------+
|  Vite Static Engine    |       |   Gemini AI Connector  |       | Third Party APIs       |
|  (React Single Page)   |       |  (@google/genai SDK)   |       | (Twilio/WhatsApp/GST)   |
+------------------------+       +------------------------+       +------------------------+
                                              |
                                              v  [Prisma Database Client]
                                 +------------+-----------+
                                 |  PostgreSQL Database   |
                                 |  (Master DB Replica)   |
                                 +------------------------+
\`\`\``
  },
  {
    id: "user-flow",
    title: "8. User Flow Mapping",
    icon: "GitMerge",
    category: "Operations",
    summary: "From lead ingestion to recurring compliance cycles and collection follow-ups.",
    markdownContent: `
### Detailed Workflow Sequences

#### Phase 1: Client Onboarding Workflow
1.  **Lead Captured**: Sales inquiry logged on lead screen.
2.  **Strategic Strategy Proposal Generated**: Partner runs AI Custom Proposal Engine.
3.  **Compliance Audit**: On conversion, client Master file is generated; business parameters (GSTIN, PAN) undergo automated formatting audits.
4.  **Task Instantiation**: Platforms auto-generates recurring task sequences (Monthly GSTR-1, TDS Return, and Board pack audits).

#### Phase 2: Monthly Recurring Compliance Lifecycle:
1.  **Analyst Notification**: Checklist populated on the 1st of every month for active client registries.
2.  **remIND Auto-Trigger**: Portal transmits automated reminders to clients to upload monthly statements.
3.  **Under Review**: Analyst logs daily timesheets, attaches finalized files, and submits the task for Partner review.
4.  **Completed Filing**: Owner logs checkoffs, triggers invoice calculations, and automatically notifies client of status changes.
`
  },
  {
    id: "dashboard-layout",
    title: "9. Dashboard Layout Design",
    icon: "LayoutGrid",
    category: "Operations",
    summary: "Strategic wireframe layout focusing on high data density and visual balance.",
    markdownContent: `
### UX Wireframe Design & Placement Specifications
The interface utilizes a left-anchored global controller combined with a multi-pane responsive layout:

*   **Header Command Bar**: Incorporates an automated alert bell, active user status badges, and quick-action menu links.
*   **KPI Metric Carousel**: Fits critical business performance indices into responsive card clusters (Annual Recurring Revenue, Total Pending Tasks, Completed Filings counts).
*   **Secondary Dashboard Grid**:
    *   *Left Workspace*: Master Project Board grouped by critical status states (Pending, Working, Auditing, Complete).
    *   *Right Workspace*: Critical items queue including expiring client dossiers and immediate financial reminders.
`
  },
  {
    id: "mobile-app-features",
    title: "10. Mobile App Features",
    icon: "Smartphone",
    category: "Operations",
    summary: "Custom field-force capabilities for real-time mobile and responsive use.",
    markdownContent: `
### Mobile Field-Force Operations
CFO business operations require continuous field access to update records during physical client visits or offsite audits:

*   **Mobile Document Snapper**: Incorporates camera scanning tools that automatically convert photos into clean PDF documents and uploads them directly to client folders in the DMS.
*   **Quick-Tap Task Logs**: Tap-and-type workflow triggers that allow Senior Associates to log daily activities or consulting notes directly on-the-go.
*   **Instant Notification Centre**: Direct push notifications sent to mobile screens when filing tasks are marked with "Critical" and "Overdue" classifications.
`
  },
  {
    id: "automation-opportunities",
    title: "11. Automation Opportunities",
    icon: "Zap",
    category: "Operations",
    summary: "Eliminate repetitive tasks through event-driven automated reminders.",
    markdownContent: `
### Operational Automation Checklist
By automating repeated document requests and reminders, consulting teams can save up to 10 hours per week:

*   **Integrated WhatsApp Auto-Reminders**: Integration via Twilio WhatsApp API that automatically messages clients when tax filings are approaching deadlines.
*   **Dynamic Partner Remonstrances**: Recurring email triggers that automatically chase external partners (such as bank loan managers or tax lawyers) for pending task actions.
*   **Automatic Retainer Billing**: Programmed workflow that automatically generates retainer invoices on the 1st of every month, maps time logs, and highlights outstanding entries.
`
  },
  {
    id: "ai-features",
    title: "12. Extended AI Features Roadmap",
    icon: "Sparkles",
    category: "Strategic",
    summary: "Advanced AI-driven analysis capabilities for predictive corporate advisory.",
    markdownContent: `
### Strategic Value Enhancements with Google Gemini GenAI:
*   **Intelligent Financial Review**: Generates high-level corporate audits by evaluating operational accounts ledger balances directly.
*   **Automatic Proposal Generation**: Creates custom CFO service proposals mapped to industry pain points (such as inventory cycles for manufacturing or variable occupancy pricing for hotels).
*   **Tax Compliance Assistant**: Direct OCR-based tax document processing that flags potential mismatch indicators in PAN and GST numbers.
`
  },
  {
    id: "future-scalability",
    title: "13. Future Scalability Plan",
    icon: "TrendingUp",
    category: "Technical",
    summary: "Architectural strategy to grow from 4-person team to multi-region consultancy.",
    markdownContent: `
### Horizontal Growth Blueprint
*   **Flexible Client Tenants**: Introduces database schemas that segregate client accounts, maintaining compliance with geographic data standards.
*   **Message Broker Integration**: Migrates repeated email notifications and PDF reports to background processing queues managed with RabbitMQ or BullMQ.
*   **Optimized Database Reads**: Integrates horizontal read-replicas in PostgreSQL to execute heavy compliance queries smoothly without impacting standard portal writes.
`
  },
  {
    id: "mvp-roadmap",
    title: "14. Six-Week MVP Launch Plan",
    icon: "CalendarRange",
    category: "Operations",
    summary: "Phased sprint timeline targeting functional project milestones.",
    markdownContent: `
### Agile Delivery Schedule

===================================================================================================================
Week 1: Schema Setup ➔ Week 2: Directory & Master database ➔ Week 3: Project Engine ➔ Week 4: DMS ➔ Week 5: Billing ➔ Week 6: Launch
===================================================================================================================

*   **Week 1 & 2**: Establish underlying relational databases, configure secure OAuth user logins, and launch the primary client master records UI.
*   **Week 3 & 4**: Implement active project tasks tracking boards and construct primary Document Management structures.
*   **Week 5 & 6**: Deploy basic billing workflows, compile the complete executive tracking dashboard, and initiate user acceptance testing.
`
  },
  {
    id: "phase-wise-development",
    title: "15. Phase-wise Development Plan",
    icon: "Clock",
    category: "Strategic",
    summary: "Long-term production phases mapping functional maturity models.",
    markdownContent: `
### Evolution Roadmap

#### Phase 1: Foundation (MVP)
*   Establish core operations structures: centralized client directories, active task boards, automated reminders, and client file vaults.

#### Phase 2: Automated Integrations
*   Connect directly with QuickBooks/Xero APIs and configure automatic reminder delivery on SMS & WhatsApp networks.

#### Phase 3: AI-Led Consulting
*   Deploy Gemini-powered diagnostic assistants, automated PDF financial analysis engines, and intelligent anomaly trackers.
`
  },
  {
    id: "monetization-possibilities",
    title: "16. Monetization Possibilities",
    icon: "Coins",
    category: "Strategic",
    summary: "SaaS packaging models for commercializing internal solutions.",
    markdownContent: `
### Commercial SaaS Strategy
*   **White-Label Corporate Portals**: License the operational template to individual tax consultant teams or medium consulting firms.
*   **Tiered Retention Fees**: Structure platform licensing into distinct tiers:
    *   *Starter Tier*: Supports 5 clients with clean document repositories.
    *   *Professional Tier*: Includes 15 clients with active task tracking and automated reminders.
    *   *Elite CFO Tier*: Dynamic AI strategic consulting, cash forecasting, and automated proposals.
`
  },
  {
    id: "security-recommendations",
    title: "17. Class-A Security Protocol",
    icon: "Shield",
    category: "Technical",
    summary: "Protecting sensitive financial files and organizational records.",
    markdownContent: `
### Core Compliance Directives
*   **Robust Encryption Standards**: Protect all sensitive database data with AES-256 storage keys and encrypt all ongoing communications with TLS 1.3 transit blocks.
*   **Strict Access Policies**: Limit database access to internal private VPC routers, protecting administrative panels with multi-factor verification keys.
*   **Granular Document Signatures**: Enforce access safety on Cloud Storage buckets using time-limited, signed URLs (e.g., active for 15 minutes max per session).
`
  },
  {
    id: "third-party-integrations",
    title: "18. Ecosystem Integrations",
    icon: "Network",
    category: "Technical",
    summary: "Seamless connection points with accounting apps and communication gates.",
    markdownContent: `
### Key Integration Interfaces
*   **Financial Ledgers**: Configure read-and-sync bridges with QuickBooks and Xero to pull current client account balances.
*   **Filing Services**: Set up API verification flows with government GST/PAN portals to automatically fetch tax payment confirmations and filing notices.
*   **Communication Networks**: Configure Twilio API lines to dispatch compliance reminders via SMS, WhatsApp, and automated email.
`
  },
  {
    id: "suggested-reports",
    title: "19. Management Reports & Analytics",
    icon: "FileChartColumn",
    category: "Strategic",
    summary: "C-Suite reporting insights measuring team efficiency and revenue margins.",
    markdownContent: `
### Indispensable Reports for Managing Directors:
*   **Debtor Aging & Outstanding Receivables**: Aggregates unpaid invoices into 30, 60, and 90-day tracking matrix intervals.
*   **Team Workload Balance Metrics**: Continuously logs active tasks per individual to prevent team burnout.
*   **Onsite Account Profitability Margin Charts**: Calculates consulting hours logged versus flat retainer billing, highlighting the client operations that yield the highest profitability margins.
`
  },
  {
    id: "ui-ux-design-suggestions",
    title: "20. UI/UX Paradigm Design Rules",
    icon: "Sparkles",
    category: "Operations",
    summary: "Visual theme standards optimizing professional corporate interaction design.",
    markdownContent: `
### Production Styling Directives
*   **Clean Visual Theme**: Uses a high-contrast theme of dark slates paired with clean charcoal highlights and professional sage-green status indicators.
*   **Comfortable Typography**: Pairs clean display headings (e.g. *Inter* or *Space Grotesk*) to establish visual focus, with monospace fonts for core compliance indexes and balance metrics.
*   **Responsive Micro-interactions**: Adds delicate fade-in states and feedback indicators to buttons, preserving clear layouts so operations remain clean, modern, and uncluttered.
`
  }
];
