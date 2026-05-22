import { Lead, Client, ProjectTask, FollowUp, DocumentInfo, TeamMember, Invoice } from './types';

export const initialLeads: Lead[] = [
  {
    id: "lead-1",
    clientName: "Oasis Luxury Resorts",
    industry: "Hotel/Resort",
    revenue: "₹25 Crores ($3M)",
    contactName: "Kabir Mehta (GM)",
    phone: "+91 98765 43210",
    email: "kabir.mehta@oasisresorts.com",
    status: "Negotiation",
    pipelineStage: "meetings-scheduled",
    assignedTo: "Rohan Sharma",
    totalValue: 36000,
    remarks: "Wants full Outsourced CFO services for resort pricing, audit control & treasury management.",
    proposalDate: "2026-05-10",
    createdAt: "2026-05-01",
    followupDate: "2026-05-24"
  },
  {
    id: "lead-2",
    clientName: "Paramount Gear Dynamics",
    industry: "Manufacturing",
    revenue: "₹120 Crores ($15M)",
    contactName: "Dinesh Patel (MD)",
    phone: "+91 98123 45678",
    email: "dinesh@paramountgears.in",
    status: "Proposal",
    pipelineStage: "proposal-tracked",
    assignedTo: "Nikita Oswal",
    totalValue: 65000,
    remarks: "Requires monthly product costing audits, cash cycle compression, and GST board reviews.",
    proposalDate: "2026-05-18",
    createdAt: "2026-05-05",
    followupDate: "2026-05-23"
  },
  {
    id: "lead-3",
    clientName: "Dr. Amit Roy Asset Fund",
    industry: "Individual FP",
    revenue: "₹15 Crores ($1.8M)",
    contactName: "Dr. Amit Roy",
    phone: "+91 99000 88776",
    email: "roy.amit@doctorstrust.org",
    status: "Enquiry",
    pipelineStage: "lead-captured",
    assignedTo: "Vikram Sen",
    totalValue: 12000,
    remarks: "Inquiry about trust configuration, high-yield municipal bond allocations and continuous tax-shield advice.",
    proposalDate: "",
    createdAt: "2026-05-20",
    followupDate: "2026-05-25"
  },
  {
    id: "lead-4",
    clientName: "Blue Ocean Logistics",
    industry: "Other",
    revenue: "₹45 Crores ($5.5M)",
    contactName: "Siddharth Sen (Director)",
    phone: "+91 88822 33445",
    email: "siddharth@blueoceanlogs.com",
    status: "Converted",
    pipelineStage: "converted",
    assignedTo: "Rohan Sharma",
    totalValue: 24000,
    remarks: "Converted, signing contract this week. Setup of accounting workflows underway.",
    proposalDate: "2026-05-12",
    createdAt: "2026-05-02",
    followupDate: "2026-05-20"
  }
];

export const initialClients: Client[] = [
  {
    id: "client-1",
    companyName: "Apex Manufacturing Ltd.",
    industry: "Manufacturing",
    pan: "AAACA1234A",
    gst: "27AAACA1234A1Z1",
    registeredAddress: "Plot B-45, MIDC Industrial Area, Pune 411018, Maharashtra",
    contacts: [
      { name: "Sanjay Shah", role: "Finance Director", email: "sanjay@apexmfg.in", phone: "+91 95555 12121" },
      { name: "Dinesh Patel", role: "Managing Director", email: "dinesh@apexmfg.in", phone: "+91 95555 12122" }
    ],
    serviceHistory: ["Monthly GST Compliance", "Inventory Reconciliation", "Quarterly Cash Flow Forecasting", "Outsourced CFO Services"],
    remarks: "Highest priority client. Heavy raw material inventory. Working capital cycle is currently at 74 days (target: 45 days)."
  },
  {
    id: "client-2",
    companyName: "Royal Palms Resort & Spa",
    industry: "Hotel/Resort",
    pan: "AAACB5678B",
    gst: "24AAACB5678B1Z2",
    registeredAddress: "S.No. 102/3, Candolim Beach Road, Goa 403515",
    contacts: [
      { name: "Nisha Rao", role: "Financial Controller", email: "nisha.rao@royalpalmsgoa.com", phone: "+91 94444 88990" },
      { name: "Rajesh Kulkarni", role: "Owner / Director", email: "rajesh@kulkarnihotels.com", phone: "+91 94444 88991" }
    ],
    serviceHistory: ["P&L Restructuring", "OTA Commission Auditing", "Monthly Operational Reviews", "Banking Compliance Support"],
    remarks: "Seasonal resort model. Focused on Average Daily Rate (ADR) optimization, and debt-restructuring follow-ups with State Bank."
  },
  {
    id: "client-3",
    companyName: "Sharma Family Estate Trust",
    industry: "Individual FP",
    pan: "APQPS9910C",
    gst: "NOT_APPLICABLE",
    registeredAddress: "Flat 14A, Skyvillas Residency, Malabar Hill, Mumbai 400006",
    contacts: [
      { name: "Arvind Sharma", role: "Client Partner / Beneficiary", email: "arvind.sharma@sharmatrust.in", phone: "+91 98200 11002" }
    ],
    serviceHistory: ["Estate Tax Shielding", "Quarterly Portfolio Auditing", "Wills and Succession Support"],
    remarks: "Private estate management. Core goal is long-term capital preservation and minimizing capital gains tax on historical equity pools."
  },
  {
    id: "client-4",
    companyName: "Starlight Polymers Corp.",
    industry: "Manufacturing",
    pan: "AABCP1102C",
    gst: "27AABCP1102C1Z3",
    registeredAddress: "G-12, Sector 5, Sanpada Industrial Belt, Navi Mumbai 400705",
    contacts: [
      { name: "Sunita Gupta", role: "Managing CEO", email: "sunita@starlightpolymers.com", phone: "+91 97771 23456" }
    ],
    serviceHistory: ["Monthly Compliance GST/TDS", "Interim CFO Advisory", "Annual Asset Valuations"],
    remarks: "Requires special corporate monitoring. Heavy export-oriented compliance and claiming GST refund processing from the customs terminal."
  }
];

export const initialTasks: ProjectTask[] = [
  {
    id: "task-1",
    title: "Monthly GSTR-1 & 3B GST Filing Checkoff",
    clientName: "Apex Manufacturing Ltd.",
    assignedTo: "Anjali Nair",
    stage: "In Progress",
    priority: "High",
    dueDate: "2026-05-24",
    description: "Reconcile purchase register with GSTR-2B before finalizing the monthly GST 3B output tax registers. Raw material ITC is high, so strict verification is required.",
    recurringType: "Monthly",
    createdAt: "2026-05-01",
    dailyUpdates: [
      { id: "u1", author: "Anjali Nair", date: "2026-05-20", message: "Purchase register downloaded; mismatch flagged in GSTR-2B of Steel supply invoice." },
      { id: "u2", author: "Anjali Nair", date: "2026-05-21", message: "Supplier notified regarding unfiled invoice. Draft return generated." }
    ]
  },
  {
    id: "task-2",
    title: "EBITDA & Working Capital Review meeting preparation",
    clientName: "Royal Palms Resort & Spa",
    assignedTo: "Rohan Sharma",
    stage: "Pending",
    priority: "Critical",
    dueDate: "2026-05-23",
    description: "Prepare the strategic board pack analyzing room occupancy overhead margins vs OTA commissions. Partner needs detailed reports to negotiate debt refi options with the bank.",
    recurringType: "Monthly",
    createdAt: "2026-05-15",
    dailyUpdates: []
  },
  {
    id: "task-3",
    title: "Estate Asset Tax Shield Mapping Review",
    clientName: "Sharma Family Estate Trust",
    assignedTo: "Vikram Sen",
    stage: "Completed",
    priority: "Medium",
    dueDate: "2026-05-20",
    description: "Review potential capital gains liabilities on shifting historical real-estate holdings into a private corporate structure.",
    recurringType: "None",
    createdAt: "2026-05-10",
    dailyUpdates: [
      { id: "u3", author: "Vikram Sen", date: "2026-05-18", message: "Wrote formal assessment memo on capital tax shielding ratios." },
      { id: "u4", author: "Nikita Oswal", date: "2026-05-20", message: "Signed-off and shared the tax strategy deck with Arvind Sharma." }
    ]
  },
  {
    id: "task-4",
    title: "GSTR-2B Input Tax Credit (ITC) Reconciliation",
    clientName: "Starlight Polymers Corp.",
    assignedTo: "Anjali Nair",
    stage: "Under Review",
    priority: "High",
    dueDate: "2026-05-24",
    description: "Comprehensive audits of input tax claims. Flag and hold supplier invoices that are missing in the filing portal.",
    recurringType: "Monthly",
    createdAt: "2026-05-12",
    dailyUpdates: [
      { id: "u5", author: "Anjali Nair", date: "2026-05-21", message: "Matching finished. 92% purchase invoices aligned perfectly. Draft uploaded for Nikita's stamp." }
    ]
  },
  {
    id: "task-5",
    title: "Monthly Cash Flow & Liquidity forecasting",
    clientName: "Apex Manufacturing Ltd.",
    assignedTo: "Vikram Sen",
    stage: "In Progress",
    priority: "Medium",
    dueDate: "2026-05-28",
    description: "Generate 13-week rolling cash flow forecasts. Consistently project raw material payments against collection timelines with major corporate clients.",
    recurringType: "Monthly",
    createdAt: "2026-05-10",
    dailyUpdates: []
  },
  {
    id: "task-6",
    title: "TDS Quarterly Filing Form 26Q Draft",
    clientName: "Starlight Polymers Corp.",
    assignedTo: "Anjali Nair",
    stage: "Pending",
    priority: "High",
    dueDate: "2026-05-29",
    description: "Quarterly TDS summary on non-salary contractor payments. Cross-reference PAN numbers to ensure no higher taxation penalties occur.",
    recurringType: "Quarterly",
    createdAt: "2026-05-15",
    dailyUpdates: []
  }
];

export const initialFollowUps: FollowUp[] = [
  {
    id: "f-1",
    targetType: "Client",
    name: "Sanjay Shah (Apex Mfg)",
    phone: "+91 95555 12121",
    email: "sanjay@apexmfg.in",
    description: "Remind client to upload April purchase register spreadsheets for reconciling GSTR-2B.",
    scheduledDate: "2026-05-22",
    frequency: "Weekly",
    status: "Pending",
    escalationStatus: "Normal"
  },
  {
    id: "f-2",
    targetType: "Partner",
    name: "HDFC Commercial Loan Desk",
    partnerType: "Banker",
    phone: "+91 22 6655 4433",
    email: "loan.officer@hdfcbank.com",
    description: "Follow up on working capital term-loan enhancement paperwork for Royal Palms Beach Club Expansion.",
    scheduledDate: "2026-05-23",
    frequency: "Once",
    status: "Pending",
    escalationStatus: "Normal"
  },
  {
    id: "f-3",
    targetType: "Partner",
    name: "CA S.P. Lodha (Tax Advisor)",
    partnerType: "Tax Consultant",
    phone: "+91 98222 55500",
    email: "lodha@lodhaco.com",
    description: "Seek advanced tax opinion clarification regarding holding conversion parameters for Sharma Family Estate.",
    scheduledDate: "2026-05-19",
    frequency: "Once",
    status: "Completed",
    escalationStatus: "Normal"
  },
  {
    id: "f-4",
    targetType: "Client",
    name: "Sunita Gupta (Starlight Polymers)",
    phone: "+91 97771 23456",
    email: "sunita@starlightpolymers.com",
    description: "Remind Sunita regarding pending director digital signature renewal key expiring on May 25th.",
    scheduledDate: "2026-05-21",
    frequency: "Once",
    status: "Pending",
    escalationStatus: "Overdue"
  },
  {
    id: "f-5",
    targetType: "Client",
    name: "Nisha Rao (Royal Palms Goa)",
    phone: "+91 94444 88990",
    email: "nisha.rao@royalpalmsgoa.com",
    description: "Request detailed guest night occupancy revenue records to reconcile hospitality metrics.",
    scheduledDate: "2026-05-15",
    frequency: "Weekly",
    status: "Pending",
    escalationStatus: "Escalated"
  }
];

export const initialDocuments: DocumentInfo[] = [
  {
    id: "doc-1",
    name: "MIDC_Unit_Purchase_Agreement_Signed.pdf",
    clientName: "Apex Manufacturing Ltd.",
    category: "Agreement",
    version: "v1.2 (Latest)",
    uploadDate: "2026-04-12",
    status: "Active",
    size: "4.8 MB"
  },
  {
    name: "GSTR_3B_ApexMfg_April_2026.pdf",
    id: "doc-2",
    clientName: "Apex Manufacturing Ltd.",
    category: "GST",
    version: "v1.0",
    uploadDate: "2026-05-18",
    status: "Active",
    size: "1.2 MB"
  },
  {
    name: "RoyalPalms_ValuationReport_SBI_2026.pdf",
    id: "doc-3",
    clientName: "Royal Palms Resort & Spa",
    category: "Bank",
    version: "v2.1",
    uploadDate: "2026-05-01",
    status: "Expiring",
    expiryDate: "2026-06-15",
    size: "11.4 MB"
  },
  {
    name: "SharmaTrust_Deed_Registered_1998.pdf",
    id: "doc-4",
    clientName: "Sharma Family Estate Trust",
    category: "Agreement",
    version: "Original Scan",
    uploadDate: "2026-05-02",
    status: "Active",
    size: "14.5 MB"
  },
  {
    name: "PAN_Card_StarlightPolymers_Verified.pdf",
    id: "doc-5",
    clientName: "Starlight Polymers Corp.",
    category: "Income Tax",
    version: "v1.0",
    uploadDate: "2026-05-15",
    status: "Active",
    size: "0.8 MB"
  },
  {
    name: "Interim_CFO_AuditStrategy_Manufacturing.pdf",
    id: "doc-6",
    clientName: "Apex Manufacturing Ltd.",
    category: "CFO Analysis",
    version: "v3.0",
    uploadDate: "2026-05-20",
    status: "Active",
    size: "3.1 MB"
  }
];

export const initialTeamMembers: TeamMember[] = [
  {
    id: "team-1",
    name: "Nikita Oswal",
    role: "CFO Partner",
    email: "canikitaoswal@gmail.com",
    activeTasks: 2,
    workloadPercentage: 45,
    performanceRating: 4.9,
    dailyActivityLog: [
      { id: "log-1", date: "2026-05-22", taskTitle: "Sharma Estate Tax Shift Planning", hoursWorked: 2.5, logText: "Reviewed capital gain tax shield parameters with client. Ready for signing." },
      { id: "log-2", date: "2026-05-21", taskTitle: "Apex Manufacturing Advisory", hoursWorked: 4, logText: "Conducted virtual call with दिनेश पटेल (MD) to detail our ABC inventory model proposal." }
    ]
  },
  {
    id: "team-2",
    name: "Rohan Sharma",
    role: "Senior Associate",
    email: "rohan.sharma@cfopartners.in",
    activeTasks: 3,
    workloadPercentage: 80,
    performanceRating: 4.7,
    dailyActivityLog: [
      { id: "log-3", date: "2026-05-22", taskTitle: "Royal Palms Resort P&L Review", hoursWorked: 5, logText: "Mapped and evaluated OTA margins against room nights metrics. Drafted debt refinancing pack." },
      { id: "log-4", date: "2026-05-21", taskTitle: "Onsite Onboarding Blue Ocean", hoursWorked: 3, logText: "Met Director Siddharth Sen to initiate accounting migration checklists." }
    ]
  },
  {
    id: "team-3",
    name: "Anjali Nair",
    role: "Compliance Analyst",
    email: "anjali.nair@cfopartners.in",
    activeTasks: 4,
    workloadPercentage: 95,
    performanceRating: 4.8,
    dailyActivityLog: [
      { id: "log-5", date: "2026-05-22", taskTitle: "Apex Manufacturing GST Matching", hoursWorked: 6.5, logText: "Reconciled purchase registers with GSTR-2B. Caught ₹1.5L unfiled transaction." },
      { id: "log-6", date: "2026-05-21", taskTitle: "Starlight polymers ITC Audit", hoursWorked: 2.5, logText: "Generated GSTR-3B draft return files." }
    ]
  },
  {
    id: "team-4",
    name: "Vikram Sen",
    role: "Finance Associate",
    email: "vikram.sen@cfopartners.in",
    activeTasks: 2,
    workloadPercentage: 55,
    performanceRating: 4.5,
    dailyActivityLog: [
      { id: "log-7", date: "2026-05-22", taskTitle: "Apex Manufacturing Rolling Forecast", hoursWorked: 4, logText: "Updated 13-week forecast model. Raw material receipts are pacing high." },
      { id: "log-8", date: "2026-05-21", taskTitle: "Sharma Trust Wills Audit", hoursWorked: 2, logText: "Checked registration parameters for real estate transfers." }
    ]
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "CFO-2026-042",
    clientName: "Apex Manufacturing Ltd.",
    amount: 5500,
    status: "Paid",
    issueDate: "2026-05-01",
    dueDate: "2026-05-15",
    items: [
      { service: "Outsourced CFO Services - Monthly Retainer", amount: 4500 },
      { service: "Special GSTR-2B Purchase Reconciliation Audit", amount: 1000 }
    ],
    retainerType: "Monthly Retainer",
    costHoursLog: 28 // 28 hours spent. Revenue = $5500. Margin is high.
  },
  {
    id: "inv-2",
    invoiceNumber: "CFO-2026-043",
    clientName: "Royal Palms Resort & Spa",
    amount: 4000,
    status: "Unpaid",
    issueDate: "2026-05-01",
    dueDate: "2026-05-25",
    items: [
      { service: "Operational Hotel Review & Debt Broker Advisory", amount: 4000 }
    ],
    retainerType: "Monthly Retainer",
    costHoursLog: 35 // 35 hours spent. $4000. Under review for profitability.
  },
  {
    id: "inv-3",
    invoiceNumber: "CFO-2026-044",
    clientName: "Sharma Family Estate Trust",
    amount: 2500,
    status: "Paid",
    issueDate: "2026-05-10",
    dueDate: "2026-05-24",
    items: [
      { service: "Estate Planning & Capital Gains Structural Consulting", amount: 2500 }
    ],
    retainerType: "One-Time Project",
    costHoursLog: 12 // 12 hours spent. High profitability margin.
  },
  {
    id: "inv-4",
    invoiceNumber: "CFO-2026-045",
    clientName: "Starlight Polymers Corp.",
    amount: 3200,
    status: "Overdue",
    issueDate: "2026-04-15",
    dueDate: "2026-04-30",
    items: [
      { service: "Interim CFO Monthly compliance & audit checks", amount: 3200 }
    ],
    retainerType: "Monthly Retainer",
    costHoursLog: 42 // 42 hours spent. Unpaid. Serious follow-up required.
  }
];
