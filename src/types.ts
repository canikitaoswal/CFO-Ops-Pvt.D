/**
 * Shared Type Definitions for CFO Operations and Strategy Platform
 */

export interface Lead {
  id: string;
  clientName: string;
  industry: 'Manufacturing' | 'Hotel/Resort' | 'Individual FP' | 'Other';
  revenue: string; // e.g., "$2.5M", "₹15 Crores"
  contactName: string;
  phone: string;
  email: string;
  status: 'Enquiry' | 'Proposal' | 'Negotiation' | 'Converted' | 'Lost';
  pipelineStage: 'lead-captured' | 'meetings-scheduled' | 'proposal-tracked' | 'converted';
  assignedTo: string;
  totalValue: number;
  remarks: string;
  proposalDate: string;
  createdAt: string;
  followupDate: string;
}

export interface ClientContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Client {
  id: string;
  companyName: string;
  industry: 'Manufacturing' | 'Hotel/Resort' | 'Individual FP' | 'Other';
  pan: string;
  gst: string;
  registeredAddress: string;
  contacts: ClientContact[];
  serviceHistory: string[];
  remarks: string;
}

export interface DailyWorkUpdate {
  id: string;
  author: string;
  date: string;
  message: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  clientName: string;
  assignedTo: string;
  stage: 'Pending' | 'In Progress' | 'Under Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  description: string;
  recurringType: 'None' | 'Monthly' | 'Quarterly' | 'Yearly';
  createdAt: string;
  dailyUpdates: DailyWorkUpdate[];
}

export interface FollowUp {
  id: string;
  targetType: 'Client' | 'Partner';
  name: string; // client contact or partner name (such as Bank/Tax Consultant)
  partnerType?: string; // "Banker" | "Tax Consultant"
  phone: string;
  email: string;
  description: string;
  scheduledDate: string;
  frequency: 'Once' | 'Weekly' | 'Monthly';
  status: 'Pending' | 'Completed';
  escalationStatus: 'Normal' | 'Overdue' | 'Escalated';
}

export interface DocumentInfo {
  id: string;
  name: string;
  clientName: string;
  category: 'GST' | 'Income Tax' | 'Bank' | 'Financial Statement' | 'CFO Analysis' | 'Agreement' | 'Other';
  version: string;
  uploadDate: string;
  status: 'Active' | 'Expiring' | 'Expired';
  expiryDate?: string;
  size: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'CFO Partner' | 'Senior Associate' | 'Compliance Analyst' | 'Finance Associate';
  email: string;
  activeTasks: number;
  workloadPercentage: number;
  performanceRating: number;
  dailyActivityLog: {
    id: string;
    date: string;
    taskTitle: string;
    hoursWorked: number;
    logText: string;
  }[];
}

export interface InvoiceItem {
  service: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  retainerType: 'Monthly Retainer' | 'One-Time Project' | 'Quarterly Retainer';
  costHoursLog: number; // For client profitability tracking (e.g. 15 hours spent)
}
