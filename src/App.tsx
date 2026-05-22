import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, CheckSquare, PhoneCall, FolderGit, 
  UserSquare2, Receipt, LayoutDashboard, Target, Plus, 
  Calendar, AlertTriangle, Clock, Search, ChevronRight, 
  Sparkles, CheckCircle2, RefreshCw, Send, FileText, Download, 
  Landmark, Filter, TrendingUp, Info, User, Check, X,
  Briefcase, MessageSquare, ShieldAlert
} from 'lucide-react';
import { initialLeads, initialClients, initialTasks, initialFollowUps, initialDocuments, initialTeamMembers, initialInvoices } from './mockData';
import { Lead, Client, ProjectTask, FollowUp, DocumentInfo, TeamMember, Invoice, DailyWorkUpdate, ClientContact } from './types';
import { blueprintSections } from './blueprintData';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'clients' | 'projects' | 'followups' | 'dms' | 'team' | 'billing' | 'blueprint' | 'settings'>('dashboard');
  
  // Authentication & Session state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbSeeding, setDbSeeding] = useState(false);

  // Master Interactive State variables loaded from local storage caches or fallback arrays
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('cfo_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('cfo_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });
  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    const saved = localStorage.getItem('cfo_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [followups, setFollowups] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem('cfo_followups');
    return saved ? JSON.parse(saved) : initialFollowUps;
  });
  const [documents, setDocuments] = useState<DocumentInfo[]>(() => {
    const saved = localStorage.getItem('cfo_documents');
    return saved ? JSON.parse(saved) : initialDocuments;
  });
  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('cfo_team');
    return saved ? JSON.parse(saved) : initialTeamMembers;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('cfo_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  // Save Sandbox state to localStorage whenever it changes
  useEffect(() => {
    if (!currentUser && !authLoading) {
      localStorage.setItem('cfo_leads', JSON.stringify(leads));
      localStorage.setItem('cfo_clients', JSON.stringify(clients));
      localStorage.setItem('cfo_tasks', JSON.stringify(tasks));
      localStorage.setItem('cfo_followups', JSON.stringify(followups));
      localStorage.setItem('cfo_documents', JSON.stringify(documents));
      localStorage.setItem('cfo_team', JSON.stringify(team));
      localStorage.setItem('cfo_invoices', JSON.stringify(invoices));
    }
  }, [leads, clients, tasks, followups, documents, team, invoices, currentUser, authLoading]);

  // Auto-seed Firestore if authenticated, database is empty and never seeded in this current browser
  const seedDbIfEmpty = async (user: FirebaseUser) => {
    if (!db) return;
    if (localStorage.getItem('cfo_cloud_seeded') === 'true') {
      console.log("Cloud already seeded or cleared once. Skipping automated fill.");
      return;
    }
    try {
      const snap = await getDocs(collection(db, 'leads'));
      if (snap.empty) {
        setDbSeeding(true);
        console.log("Seeding Firestore databases with high-fidelity corporate datasets...");
        
        // Use batch writes to populate collections efficiently and atomically
        const batch = writeBatch(db);
        
        initialLeads.forEach(lead => {
          batch.set(doc(db, 'leads', lead.id), lead);
        });
        initialClients.forEach(client => {
          batch.set(doc(db, 'clients', client.id), client);
        });
        initialTasks.forEach(task => {
          batch.set(doc(db, 'tasks', task.id), task);
        });
        initialFollowUps.forEach(fup => {
          batch.set(doc(db, 'followups', fup.id), fup);
        });
        initialDocuments.forEach(docInfo => {
          batch.set(doc(db, 'documents', docInfo.id), docInfo);
        });
        initialTeamMembers.forEach(member => {
          batch.set(doc(db, 'team', member.id), member);
        });
        initialInvoices.forEach(invoice => {
          batch.set(doc(db, 'invoices', invoice.id), invoice);
        });

        await batch.commit();
        console.log("Firestore successfully initialized & seed data deployed.");
        localStorage.setItem('cfo_cloud_seeded', 'true');
      }
    } catch (error) {
      console.error("Optional auto-seeding error (likely due to security rules or offline state):", error);
    } finally {
      setDbSeeding(false);
    }
  };

  // Real-time Firebase Firestore Synchronizer
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // First check and auto-seed if empty
        await seedDbIfEmpty(user);

        // Subscribe to all collections
        const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
          const list: Lead[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Lead);
          });
          setLeads(list);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'leads'));

        const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
          const list: Client[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Client);
          });
          setClients(list);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'clients'));

        const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
          const list: ProjectTask[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as ProjectTask);
          });
          setTasks(list);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

        const unsubFollowups = onSnapshot(collection(db, 'followups'), (snapshot) => {
          const list: FollowUp[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as FollowUp);
          });
          setFollowups(list);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'followups'));

        const unsubDocs = onSnapshot(collection(db, 'documents'), (snapshot) => {
          const list: DocumentInfo[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as DocumentInfo);
          });
          setDocuments(list);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'documents'));

        const unsubTeam = onSnapshot(collection(db, 'team'), (snapshot) => {
          const list: TeamMember[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as TeamMember);
          });
          setTeam(list);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'team'));

        const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
          const list: Invoice[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Invoice);
          });
          setInvoices(list);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'invoices'));

        return () => {
          unsubLeads();
          unsubClients();
          unsubTasks();
          unsubFollowups();
          unsubDocs();
          unsubTeam();
          unsubInvoices();
        };
      } else {
        // Load persistent local/sandbox datasets when signed out
        setLeads(JSON.parse(localStorage.getItem('cfo_leads') || JSON.stringify(initialLeads)));
        setClients(JSON.parse(localStorage.getItem('cfo_clients') || JSON.stringify(initialClients)));
        setTasks(JSON.parse(localStorage.getItem('cfo_tasks') || JSON.stringify(initialTasks)));
        setFollowups(JSON.parse(localStorage.getItem('cfo_followups') || JSON.stringify(initialFollowUps)));
        setDocuments(JSON.parse(localStorage.getItem('cfo_documents') || JSON.stringify(initialDocuments)));
        setTeam(JSON.parse(localStorage.getItem('cfo_team') || JSON.stringify(initialTeamMembers)));
        setInvoices(JSON.parse(localStorage.getItem('cfo_invoices') || JSON.stringify(initialInvoices)));
      }
    });

    return () => unsubAuth();
  }, []);

  // Business profile Settings loaded in state
  const [businessSettings, setBusinessSettings] = useState({
    businessName: "CFO Ops Pro Ltd.",
    logoUrl: "💎",
    gstin: "27APQPS8890D1Z0",
    pan: "APQPS8890D",
    contactEmail: "partner@cfoops.enterprise",
    currency: "USD ($)",
    reminderGraceDays: 3,
    taxPercentage: 18
  });

  // Welcome / Onboarding First Run Modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter & Search variables
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<'All' | 'Manufacturing' | 'Hotel/Resort' | 'Individual FP'>('All');
  
  // Interactive Modals / Forms controllers
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState<ProjectTask | null>(null);
  const [newUpdateMessage, setNewUpdateMessage] = useState('');

  // Ref hook for focused global check search
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync state reset handler
  const resetDemoDataset = async () => {
    localStorage.setItem('cfo_cloud_seeded', 'true');
    if (currentUser) {
      try {
        setDbSeeding(true);
        console.log("Deep restoring remote database to factory defaults...");
        const batch = writeBatch(db);
        
        // Write all standard mock data over the existing ones
        initialLeads.forEach(lead => {
          batch.set(doc(db, 'leads', lead.id), lead);
        });
        initialClients.forEach(client => {
          batch.set(doc(db, 'clients', client.id), client);
        });
        initialTasks.forEach(task => {
          batch.set(doc(db, 'tasks', task.id), task);
        });
        initialFollowUps.forEach(fup => {
          batch.set(doc(db, 'followups', fup.id), fup);
        });
        initialDocuments.forEach(docInfo => {
          batch.set(doc(db, 'documents', docInfo.id), docInfo);
        });
        initialTeamMembers.forEach(member => {
          batch.set(doc(db, 'team', member.id), member);
        });
        initialInvoices.forEach(invoice => {
          batch.set(doc(db, 'invoices', invoice.id), invoice);
        });

        await batch.commit();
        alert("🔄 Remote Database successfully reset & fully synchronized with factory mock data.");
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'batch-reset');
      } finally {
        setDbSeeding(false);
      }
    } else {
      localStorage.setItem('cfo_leads', JSON.stringify(initialLeads));
      localStorage.setItem('cfo_clients', JSON.stringify(initialClients));
      localStorage.setItem('cfo_tasks', JSON.stringify(initialTasks));
      localStorage.setItem('cfo_followups', JSON.stringify(initialFollowUps));
      localStorage.setItem('cfo_documents', JSON.stringify(initialDocuments));
      localStorage.setItem('cfo_team', JSON.stringify(initialTeamMembers));
      localStorage.setItem('cfo_invoices', JSON.stringify(initialInvoices));
      
      setLeads(initialLeads);
      setClients(initialClients);
      setTasks(initialTasks);
      setFollowups(initialFollowUps);
      setDocuments(initialDocuments);
      setTeam(initialTeamMembers);
      setInvoices(initialInvoices);
      alert("🔄 Local Demo Data has been restored to factory state successfully.");
    }
  };

  // Completely wipe data for clean testing experience
  const clearDatabase = async () => {
    if (!window.confirm("Are you sure you want to delete ALL records? This will clear all pipelines, directories, billing ledgers, and coordination tasks, giving you an entirely blank slate for testing.")) return;
    localStorage.setItem('cfo_cloud_seeded', 'true'); // block auto-seeding on fresh starts
    
    if (currentUser) {
      try {
        setDbSeeding(true);
        console.log("Wiping remote Firestore database...");
        
        // Let's delete the items in current state
        const deleteBatch = writeBatch(db);
        leads.forEach(l => deleteBatch.delete(doc(db, 'leads', l.id)));
        clients.forEach(c => deleteBatch.delete(doc(db, 'clients', c.id)));
        tasks.forEach(t => deleteBatch.delete(doc(db, 'tasks', t.id)));
        followups.forEach(f => deleteBatch.delete(doc(db, 'followups', f.id)));
        documents.forEach(d => deleteBatch.delete(doc(db, 'documents', d.id)));
        team.forEach(m => deleteBatch.delete(doc(db, 'team', m.id)));
        invoices.forEach(i => deleteBatch.delete(doc(db, 'invoices', i.id)));
        
        await deleteBatch.commit();
        alert("🗑️ Cloud Database wiped. All collections are now completely clean!");
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, 'wipe-batch');
      } finally {
        setDbSeeding(false);
      }
    } else {
      localStorage.setItem('cfo_leads', JSON.stringify([]));
      localStorage.setItem('cfo_clients', JSON.stringify([]));
      localStorage.setItem('cfo_tasks', JSON.stringify([]));
      localStorage.setItem('cfo_followups', JSON.stringify([]));
      localStorage.setItem('cfo_documents', JSON.stringify([]));
      localStorage.setItem('cfo_team', JSON.stringify([]));
      localStorage.setItem('cfo_invoices', JSON.stringify([]));

      setLeads([]);
      setClients([]);
      setTasks([]);
      setFollowups([]);
      setDocuments([]);
      setTeam([]);
      setInvoices([]);
      alert("🗑️ Sandbox wiped. Temporary local states have been cleared successfully.");
    }
  };

  // Operational Record Deletes
  const handleDeleteLead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Confirm deletion of this Lead?")) return;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'leads', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `leads/${id}`);
      }
    } else {
      setLeads(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteClient = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Confirm deletion of this Client Record? This maps services, contacts, and metadata.")) return;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'clients', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
      }
    } else {
      setClients(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteTask = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Confirm deletion of this Compliance Task?")) return;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
      }
    } else {
      setTasks(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteFollowUp = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Confirm deletion of this Reminder Reminder/Follow-up?")) return;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'followups', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `followups/${id}`);
      }
    } else {
      setFollowups(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteDocument = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Confirm permanent removal of this Document from platform registry?")) return;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'documents', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `documents/${id}`);
      }
    } else {
      setDocuments(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteTeamMember = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Confirm deletion of this Team Member/CA Partner record?")) return;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'team', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `team/${id}`);
      }
    } else {
      setTeam(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteInvoice = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Confirm deletion of this Invoice Ledger Entry?")) return;
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'invoices', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
      }
    } else {
      setInvoices(prev => prev.filter(item => item.id !== id));
    }
  };

  // Keyboard shortcut listener (Ctrl+K = focus search, ESC = close overlay layers)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowAddLeadModal(false);
        setShowAddClientModal(false);
        setShowAddTaskModal(false);
        setSelectedTaskForUpdate(null);
        setShowWelcomeModal(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Form Fields State (CRM & Leads)
  const [leadForm, setLeadForm] = useState({
    clientName: '',
    industry: 'Manufacturing' as Lead['industry'],
    revenue: '',
    contactName: '',
    phone: '',
    email: '',
    totalValue: 25000,
    remarks: '',
    followupDate: '2026-05-30'
  });

  // Form Fields State (Client Master)
  const [clientForm, setClientForm] = useState({
    companyName: '',
    industry: 'Manufacturing' as Client['industry'],
    pan: '',
    gst: '',
    registeredAddress: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    remarks: ''
  });

  // Form Fields State (Task Creator)
  const [taskForm, setTaskForm] = useState({
    title: '',
    clientName: '',
    assignedTo: '',
    priority: 'Medium' as ProjectTask['priority'],
    dueDate: '2026-06-15',
    description: '',
    recurringType: 'None' as ProjectTask['recurringType']
  });

  // Document Upload Emulator State
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [uploadedDocClient, setUploadedDocClient] = useState('');
  const [uploadedDocCat, setUploadedDocCat] = useState<'GST' | 'Income Tax' | 'Bank' | 'Financial Statement' | 'CFO Analysis' | 'Agreement' | 'Other'>('GST');

  // AI Consultation Advisory System State
  const [cfoQuery, setCfoQuery] = useState('How can we optimize working capital cycle for a manufacturing firm with high inventory levels?');
  const [selectedAdvisoryArea, setSelectedAdvisoryArea] = useState<'manufacturing' | 'hospitality' | 'general'>('manufacturing');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSource, setAiSource] = useState<string>('');

  // AI Active Proposal Builder
  const [aiProposalClientId, setAiProposalClientId] = useState<string>('lead-2'); // default to start
  const [generatedProposalText, setGeneratedProposalText] = useState<string>('');
  const [proposalGenerating, setProposalGenerating] = useState(false);

  // Status counters for high-density overview highlights
  const activeLeadsCount = leads.filter(l => l.status !== 'Converted' && l.status !== 'Lost').length;
  const inProgressTasksCount = tasks.filter(t => t.stage !== 'Completed').length;
  const followupsTodayCount = followups.filter(f => f.status === 'Pending').length;
  const totalOutstandingBilling = invoices.filter(i => i.status !== 'Paid').reduce((sum, inv) => sum + inv.amount, 0);

  // Helper: Triggers simulated action or schedules
  const handleSimulateNotification = (message: string) => {
    alert(`🕒 Dynamic Action Scheduled: ${message}`);
  };

  // Add simulated activity in task log
  const handleAddTaskUpdate = async (taskId: string) => {
    if (!newUpdateMessage.trim()) return;
    const newUpdate: DailyWorkUpdate = {
      id: `u-${Date.now()}`,
      author: currentUser?.displayName || "Nikita Oswal (CFO)",
      date: new Date().toISOString().split('T')[0],
      message: newUpdateMessage
    };

    if (currentUser) {
      try {
        const t = tasks.find(item => item.id === taskId);
        if (t) {
          const updatedUpdates = [...t.dailyUpdates, newUpdate];
          const updatedStage = t.stage === 'Pending' ? 'In Progress' as const : t.stage;
          await setDoc(doc(db, 'tasks', taskId), {
            ...t,
            dailyUpdates: updatedUpdates,
            stage: updatedStage
          });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `tasks/${taskId}`);
      }
    } else {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            dailyUpdates: [...t.dailyUpdates, newUpdate],
            stage: t.stage === 'Pending' ? 'In Progress' : t.stage // upgrade stage naturally
          };
        }
        return t;
      }));
    }
    setNewUpdateMessage('');
    setSelectedTaskForUpdate(null);
  };

  // Add Client
  const submitClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.companyName) return;

    const newClient: Client = {
      id: `client-${Date.now()}`,
      companyName: clientForm.companyName,
      industry: clientForm.industry,
      pan: clientForm.pan || "APQPS8890D",
      gst: clientForm.gst || "27APQPS8890D1Z0",
      registeredAddress: clientForm.registeredAddress || "Mumbai Office Zone",
      contacts: [
        {
          name: clientForm.contactName || "Key Contact",
          role: clientForm.contactRole || "General Manager",
          email: clientForm.contactEmail || "info@corporate.co",
          phone: clientForm.contactPhone || "+91 99999 88888"
        }
      ],
      serviceHistory: ["Onboarding Audit", "Compliance Setup"],
      remarks: clientForm.remarks || "Newly onboarded via Operations Center"
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'clients', newClient.id), newClient);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `clients/${newClient.id}`);
      }
    } else {
      setClients([newClient, ...clients]);
    }
    setShowAddClientModal(false);
    setClientForm({
      companyName: '',
      industry: 'Manufacturing',
      pan: '',
      gst: '',
      registeredAddress: '',
      contactName: '',
      contactRole: '',
      contactEmail: '',
      contactPhone: '',
      remarks: ''
    });
  };

  // Add Lead
  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.clientName) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      clientName: leadForm.clientName,
      industry: leadForm.industry,
      revenue: leadForm.revenue || "₹10 Crores ($1.2M)",
      contactName: leadForm.contactName,
      phone: leadForm.phone,
      email: leadForm.email,
      status: 'Enquiry',
      pipelineStage: 'lead-captured',
      assignedTo: 'Nikita Oswal',
      totalValue: Number(leadForm.totalValue),
      remarks: leadForm.remarks || "Captured via CFO Command Center",
      proposalDate: '',
      createdAt: new Date().toISOString().split('T')[0],
      followupDate: leadForm.followupDate
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'leads', newLead.id), newLead);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `leads/${newLead.id}`);
      }
    } else {
      setLeads([newLead, ...leads]);
    }
    setShowAddLeadModal(false);
    setLeadForm({
      clientName: '',
      industry: 'Manufacturing',
      revenue: '',
      contactName: '',
      phone: '',
      email: '',
      totalValue: 25000,
      remarks: '',
      followupDate: '2026-05-30'
    });
  };

  // Add Task
  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.clientName) return;

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      title: taskForm.title,
      clientName: taskForm.clientName,
      assignedTo: taskForm.assignedTo || "Anjali Nair",
      stage: 'Pending',
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      description: taskForm.description || "Recurring strategic audit procedures.",
      recurringType: taskForm.recurringType,
      createdAt: new Date().toISOString().split('T')[0],
      dailyUpdates: []
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'tasks', newTask.id), newTask);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `tasks/${newTask.id}`);
      }
    } else {
      setTasks([newTask, ...tasks]);
    }
    setShowAddTaskModal(false);
    setTaskForm({
      title: '',
      clientName: '',
      assignedTo: '',
      priority: 'Medium',
      dueDate: '2026-06-15',
      description: '',
      recurringType: 'None'
    });
  };

  // Convert Lead to Client Automatically
  const convertLeadToClientInstance = async (lead: Lead) => {
    // 1. Prepare updates
    const updatedLeadStatus = { status: 'Converted' as const, pipelineStage: 'converted' as const };
    
    // 2. Prepare actual running client
    const customClient: Client = {
      id: `client-conv-${lead.id}`,
      companyName: lead.clientName,
      industry: lead.industry,
      pan: "FORM-PENDING",
      gst: "GST-PENDING",
      registeredAddress: "Please verify registered office address.",
      contacts: [
        { name: lead.contactName || "Primary Liaison", role: "MD / Promoter", email: lead.email, phone: lead.phone }
      ],
      serviceHistory: ["Converted CFO Advisory Service Plan"],
      remarks: `Lead converted automatically on 2026-05-22. Value contract: $${lead.totalValue}/yr. ${lead.remarks}`
    };

    // 3. Prepare custom task
    const customTask: ProjectTask = {
      id: `task-conv-${lead.id}`,
      title: `Onboarding & Entity Strategy Setup`,
      clientName: lead.clientName,
      assignedTo: "Rohan Sharma",
      stage: "In Progress",
      priority: "Critical",
      dueDate: new Date(Date.now() + 5*24*3600*1000).toISOString().split('T')[0],
      description: `Setup complete corporate documentation vaults, extract historical Excel models and perform GSTR verification audit.`,
      recurringType: 'None',
      createdAt: new Date().toISOString().split('T')[0],
      dailyUpdates: [
        { id: `u-init`, author: "CFO Bot", date: "2026-05-22", message: `System initialized. Onboarding mapped to Rohan Sharma.` }
      ]
    };

    if (currentUser) {
      try {
        const batch = writeBatch(db);
        batch.update(doc(db, 'leads', lead.id), updatedLeadStatus);
        batch.set(doc(db, 'clients', customClient.id), customClient);
        batch.set(doc(db, 'tasks', customTask.id), customTask);
        await batch.commit();
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'lead-convert-batch');
      }
    } else {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, ...updatedLeadStatus } : l));
      setClients([customClient, ...clients]);
      setTasks([customTask, ...tasks]);
    }
    alert(`🎉 Excellent! Lead '${lead.clientName}' converted successfully! Active Onboarding tasks dispatched to Rohan Sharma.`);
  };

  // Document upload simulation
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedDocName) return;

    const newDoc: DocumentInfo = {
      id: `doc-${Date.now()}`,
      name: uploadedDocName.endsWith('.pdf') ? uploadedDocName : `${uploadedDocName}.pdf`,
      clientName: uploadedDocClient || "Apex Manufacturing Ltd.",
      category: uploadedDocCat,
      version: "v1.0 (Latest)",
      uploadDate: new Date().toISOString().split('T')[0],
      status: "Active",
      size: "2.4 MB"
    };

    if (currentUser) {
      try {
        await setDoc(doc(db, 'documents', newDoc.id), newDoc);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `documents/${newDoc.id}`);
      }
    } else {
      setDocuments([newDoc, ...documents]);
    }
    setUploadedDocName('');
    alert(`📂 Document "${newDoc.name}" uploaded successfully into SECURE VAULT with AES-256 validation.`);
  };

  // Run CFO query utilizing deep Generative AI endpoint
  const queryCfoAdvisor = async () => {
    setAiGenerating(true);
    setAiResponse('');
    try {
      const response = await fetch('/api/cfo-consulting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'consulting',
          payload: {
            query: cfoQuery,
            focusArea: selectedAdvisoryArea
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiResponse(data.text);
        setAiSource(data.sources ? data.sources.join(', ') : 'CFO Intelligence Node');
      } else {
        setAiResponse(`Failed to contact cfo strategic system. Error: ${data.error}`);
      }
    } catch (e: any) {
      setAiResponse(`Server communication failure. Default fallback activated.\n\n### Strategic CFO Advice:\n- Shorten supplier wait terms.\n- Run active debt refit ratios with bank.`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Draft customized strategic CFO proposal
  const generateCfoProposal = async (leadId: string) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;

    setProposalGenerating(true);
    setGeneratedProposalText('');
    setAiProposalClientId(leadId);

    try {
      const response = await fetch('/api/cfo-consulting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'proposal',
          payload: {
            clientName: targetLead.clientName,
            industry: targetLead.industry,
            revenue: targetLead.revenue,
            specificProblems: targetLead.remarks,
            totalValue: targetLead.totalValue
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedProposalText(data.text);
      } else {
        setGeneratedProposalText(`Error organizing proposal guidelines: ${data.error}`);
      }
    } catch (e: any) {
      setGeneratedProposalText(`Error matching connection: ${e.message}`);
    } finally {
      setProposalGenerating(false);
    }
  };

  // Trigger quick proposal upon first launch
  useEffect(() => {
    queryCfoAdvisor();
  }, []);

  return (
    <div id="cfo-platform-root" className="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden text-slate-900 relative">
      
      {/* MOBILE OVERLAY BACKGROUND PANEL */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
        />
      )}

      {/* SIDEBAR NAVIGATION CONTROLS */}
      <aside className={`fixed lg:relative top-0 bottom-0 left-0 w-72 bg-slate-900 text-white flex flex-col h-full shrink-0 z-40 transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg select-none shadow-md shadow-blue-500/20">
              {businessSettings.logoUrl}
            </div>
            <div>
              <span className="font-semibold tracking-tight text-base block leading-none text-white">{businessSettings.businessName}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Outsourced CFO Enterprise</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 text-slate-300 text-[9px] px-2 py-0.5 rounded font-mono">v1.2</span>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white p-1 text-xs"
              title="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 border-b border-slate-800/60 font-sans">
          {authLoading ? (
            <div className="flex items-center gap-2 p-2 justify-center text-xs text-slate-400">
              <span className="animate-spin text-sm">🔄</span>
              <span>Syncing session...</span>
            </div>
          ) : currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded bg-slate-800/40 border border-slate-700/30">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Initials" 
                    className="w-8 h-8 rounded-full border border-blue-500/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'CO'}
                  </div>
                )}
                <div className="truncate flex-1">
                  <div className="text-xs font-semibold text-slate-100 truncate">
                    {currentUser.displayName || 'Consulting Partner'}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block animate-pulse" />
                    <span>DB CONNECTED</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] text-slate-500 font-mono truncate max-w-[130px]" title={currentUser.email || ''}>
                  {currentUser.email}
                </span>
                <button 
                  onClick={logoutUser}
                  className="text-[9px] text-red-450 hover:text-red-400 bg-red-950/20 px-2 py-0.5 rounded transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-1 space-y-2">
              <div className="text-[10px] text-amber-500 flex items-center gap-1 font-semibold">
                <span>⚠️</span>
                <span>Offline / Sandbox Mode</span>
              </div>
              <button 
                onClick={loginWithGoogle}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white p-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>🔑</span>
                <span>Connect Google DB</span>
              </button>
              {dbSeeding && (
                <div className="text-[9px] text-blue-400 flex items-center gap-1 justify-center animate-pulse">
                  <span>⚙️</span> Seeding core tables...
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 px-2 font-bold">Main Operations</div>
          
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'dashboard' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard size={16} />
              <span>Dashboard Overview</span>
            </div>
            <span className="bg-red-500/20 text-red-300 text-[9px] px-1.5 py-0.2 rounded font-bold font-mono">11</span>
          </button>

          <button 
            onClick={() => { setActiveTab('crm'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'crm' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <Target size={16} />
              <span>CRM & Leads Ingestion</span>
            </div>
            <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
              {leads.filter(l => l.status !== 'Converted').length}
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('clients'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'clients' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 size={16} />
              <span>Corporate Master Directory</span>
            </div>
            <span className="bg-slate-850 text-slate-400 text-[10px] font-mono font-bold">{clients.length}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('projects'); setSearchQuery(''); }} 
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'projects' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare size={16} />
              <span>Project Compliance Board</span>
            </div>
            <span className="bg-yellow-500/15 text-yellow-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
              {tasks.filter(t => t.stage !== 'Completed').length}
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('followups'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'followups' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall size={16} />
              <span>Follow-ups & remIND</span>
            </div>
            <span className="text-red-400 text-[10px] bg-red-950/40 px-1 font-mono">1 Overdue</span>
          </button>

          <button 
            onClick={() => { setActiveTab('dms'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'dms' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <FolderGit size={16} />
              <span>Operational DMS Vault</span>
            </div>
          </button>

          <div className="mt-8 text-[10px] uppercase tracking-widest text-slate-500 mb-2 px-2 font-bold">Finance & Fleet</div>

          <button 
            onClick={() => setActiveTab('team')} 
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'team' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <UserSquare2 size={16} />
              <span>Team Workspace Balance</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('billing')} 
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'billing' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <Receipt size={16} />
              <span>Billing & Retainer margins</span>
            </div>
          </button>

          <div className="mt-8 text-[10px] uppercase tracking-widest text-teal-400 mb-2 px-2 font-bold">Expert CFO Blueprint</div>

          <button 
            onClick={() => setActiveTab('blueprint')} 
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'blueprint' ? 'bg-teal-600/20 text-teal-300 font-semibold border-l-4 border-teal-500' : 'text-slate-400 hover:bg-slate-850/70 hover:text-teal-200'}`}
          >
            <div className="flex items-center gap-2.5">
              <Target size={16} className="text-teal-400" />
              <span>SaaS System Blueprint</span>
            </div>
            <span className="bg-teal-500/20 text-teal-300 text-[8px] uppercase font-mono px-1 rounded">20 Specs</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all text-left text-xs ${activeTab === 'settings' ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-4 border-blue-500' : 'text-slate-400 hover:bg-slate-850/70 hover:text-white'}`}
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw size={16} />
              <span>Settings & Controls</span>
            </div>
            <span className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">Config</span>
          </button>
        </nav>

        {/* BOTTOM METRIC RAIL */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Team Core Workload</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">94% Max</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-3">
            <div className="bg-emerald-400 h-full w-[82%]"></div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
            <span>Pending Audits: {tasks.filter(t => t.stage === 'Under Review').length}</span>
            <span>Vite Port: 3000 Node</span>
          </div>
        </div>
      </aside>

      {/* CORE FRAMEWORK REGION */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* UPPER STATUS & SECTOR COMMAND BAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none h-10 w-10 flex items-center justify-center font-bold text-lg"
              title="Open Navigation Drawer"
              aria-label="Open Navigation Drawer"
            >
              ☰
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search master accounts, projects, or docs... (Ctrl+K)" 
                className="pl-9 pr-12 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-lg text-xs w-60 sm:w-80 md:w-96 font-medium focus:ring-2 focus:ring-blue-550 focus:ring-blue-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Global Search input"
              />
              <span className="hidden sm:inline-block absolute right-3 top-2 text-[9px] text-slate-400 bg-slate-100 border px-1 rounded font-mono select-none">
                Ctrl+K
              </span>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-12 top-2 text-slate-400 hover:text-slate-600 text-xs font-semibold">✕</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Quick Action drop indicators */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-medium text-amber-800 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-550 bg-amber-500 animate-pulse"></span>
              <span>Compliance Sync Active</span>
            </div>

            {/* Quick add triggers */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  if (activeTab === 'crm') setShowAddLeadModal(true);
                  else if (activeTab === 'clients') setShowAddClientModal(true);
                  else setShowAddTaskModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm select-none"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add {activeTab === 'crm' ? 'Lead' : activeTab === 'clients' ? 'Client' : 'Task'}</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Quick Help Guide tooltips */}
            <button
              onClick={() => setShowWelcomeModal(true)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-150 border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors text-slate-600"
              title="Help Tour & Guidelines"
              aria-label="Show help guidelines guide"
            >
              ❓
            </button>

            {/* Notification indicators */}
            <div 
              onClick={() => handleSimulateNotification("No new critical regulatory alerts on government portals today.")}
              className="w-10 h-10 flex items-center justify-center relative bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg cursor-pointer transition-colors"
              title="Government Portal Notifications"
              aria-label="View notifications list"
            >
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <span className="text-sm">🔔</span>
            </div>
          </div>
        </header>

        {/* INNER DYNAMIC SECTION BODY VIEWPORTS */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* ==================== TAB 1: OVERVIEW DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">CFO Command Headquarters</h1>
                  <p className="text-slate-500 text-xs mt-1">Real-time status monitor for 4 active consultants servicing manufacturing and leisure assets.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">Current system date: May 22, 2026</span>
                  <button onClick={() => alert("Re-syncing with MCA, GSTIN portal & Banker dashboards...")} className="p-1 px-2.5 text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 rounded flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin-slow" />
                    <span>Sync Gates</span>
                  </button>
                </div>
              </div>

              {/* STATS DECK */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTab('crm')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">CRM Active Leads</span>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-slate-900">{activeLeadsCount}</span>
                      <span className="text-emerald-500 text-[11px] block mt-1">High conversion rating</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('projects')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Ongoing Audits</span>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-blue-600">{inProgressTasksCount}</span>
                      <span className="text-slate-500 text-[11px] block mt-1">3 Under review by Partner</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('followups')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Follow-ups Pending</span>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-red-500">{followupsTodayCount}</span>
                      <span className="text-amber-600 text-[11px] block mt-1">1 overdue alert</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('billing')}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Receivables Ledger</span>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-slate-900">${totalOutstandingBilling.toLocaleString()}</span>
                      <span className="text-amber-500 text-[11px] block mt-1">Starlight polymers overdue</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>

              {/* SPLIT LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* DENSITY WORK Stages IN PROGRESS */}
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">Critical Compliance Pipelines</h3>
                      <p className="text-slate-500 text-[10px] mt-0.5">Urgent assignments matching multi-stage verification deadlines</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('projects')}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      View all tasks ({tasks.length})
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3">Task Details</th>
                          <th className="px-6 py-3">Target Client</th>
                          <th className="px-6 py-3">Stage Status</th>
                          <th className="px-6 py-3">Risk Level</th>
                          <th className="px-6 py-3">Assigned Lead</th>
                          <th className="px-6 py-3">Due Timeline</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                        {tasks.slice(0, 4).map(task => (
                          <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-900 block">{task.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{task.recurringType} Compliance Cycle</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">{task.clientName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                task.stage === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                task.stage === 'Under Review' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                task.stage === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {task.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                                task.priority === 'Critical' ? 'text-red-600 bg-red-50 font-bold' :
                                task.priority === 'High' ? 'text-orange-600 bg-orange-50 font-semibold' :
                                'text-slate-600'
                              }`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-600">{task.assignedTo}</td>
                            <td className="px-6 py-4 text-xs font-mono">{task.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT SYSTEM COLUMN */}
                <div className="space-y-6">
                  
                  {/* UNIFIED REAL-TIME FOLLOW UPS & ESCALATIONS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-widest">Follow ups Due</h4>
                      <span className="text-[10px] text-red-500 font-bold font-mono">⚠️ 1 Overdue</span>
                    </div>

                    <div className="space-y-3">
                      {followups.slice(0, 3).map(f => (
                        <div 
                          key={f.id} 
                          className={`p-3 border rounded-xl flex items-start gap-2.5 transition-all ${
                            f.escalationStatus === 'Overdue' ? 'bg-red-50/60 border-red-200' :
                            f.escalationStatus === 'Escalated' ? 'bg-amber-50/60 border-amber-200' :
                            'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="text-xl">
                            {f.targetType === 'Client' ? '📞' : '🤝'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 justify-between">
                              <span className="text-xs font-bold text-slate-900 block truncate">{f.name}</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider px-1 bg-white text-slate-500 rounded border">
                                {f.targetType}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate leading-relaxed">{f.description}</span>
                            <span className="text-[9px] text-slate-400 font-semibold mt-1 block font-mono">Date: {f.scheduledDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setActiveTab('followups')}
                      className="w-full mt-4 py-2 border border-slate-200 hover:bg-slate-50 transition-all text-xs font-semibold text-blue-600 rounded-lg text-center"
                    >
                      Open Follow-up Dashboard
                    </button>
                  </div>

                  {/* QUICK ADVISORY CORNER (GENIAL CONNECTIVITY) */}
                  <div className="bg-slate-900 rounded-xl p-5 shadow-lg text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🤖</span>
                        <h4 className="font-bold text-sm tracking-tight text-slate-100">AI Advisory Terminal</h4>
                      </div>
                      <p className="text-slate-400 text-xs mb-4">Pose specialized pricing or audits queries to standard Gemini consultation models.</p>
                      
                      <div className="space-y-2 mb-4">
                        <input 
                          type="text"
                          className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                          value={cfoQuery}
                          onChange={(e) => setCfoQuery(e.target.value)}
                        />
                        <button 
                          onClick={queryCfoAdvisor}
                          disabled={aiGenerating}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {aiGenerating ? 'Optimizing models...' : 'Request strategic CFO audit'}
                        </button>
                      </div>

                      {aiResponse && (
                        <div className="bg-slate-950 p-3 rounded text-[11px] text-slate-300 font-mono mt-3 max-h-36 overflow-y-auto border border-slate-800 scrollbar-thin">
                          {aiResponse}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}


          {/* ==================== TAB 2: CRM & LEADS INGESTION ==================== */}
          {activeTab === 'crm' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">CRM & Lead Pipeline</h1>
                  <p className="text-slate-500 text-xs mt-1">Acquire and structure mid-market outsourced CFO mandates. Process strategic pipeline transitions.</p>
                </div>
                
                <button 
                  onClick={() => setShowAddLeadModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Ingest New Lead</span>
                </button>
              </div>

              {/* DEMO PIPELINE PHASES METRICS VISUAL */}
              <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">1. Lead Captured</div>
                  <div className="text-xl font-bold mt-1 text-slate-900">
                    {leads.filter(l => l.pipelineStage === 'lead-captured').length} Active
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">2. Meeting Scheduled</div>
                  <div className="text-xl font-bold mt-1 text-slate-900">
                    {leads.filter(l => l.pipelineStage === 'meetings-scheduled').length} Active
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-indigo-505 border-l-purple-500">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">3. Proposal Checked</div>
                  <div className="text-xl font-bold mt-1 text-slate-900">
                    {leads.filter(l => l.pipelineStage === 'proposal-tracked').length} Active
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-emerald-500">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">4. Converted Mandate</div>
                  <div className="text-xl font-bold mt-1 text-emerald-600">
                    {leads.filter(l => l.status === 'Converted').length} Converted
                  </div>
                </div>
              </div>

              {/* TWO PANEL: LEADS LIST & DETAILED AI PROPOSAL BUILDER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LIST PANEL */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                    <span className="font-bold text-xs text-slate-850 uppercase tracking-widest">Active Proposals Intake</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{leads.length} leads in platform</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {leads.map(l => (
                      <div key={l.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-slate-900">{l.clientName}</h3>
                              <span className="text-[9px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                                {l.industry}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px] mt-1">
                              <strong>Revenue context:</strong> {l.revenue} | <strong>Liaison:</strong> {l.contactName}
                            </p>
                            <p className="text-xs text-slate-700 italic border-l-2 border-slate-300 pl-2 mt-2">
                              "{l.remarks}"
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-slate-900">${l.totalValue.toLocaleString()}/yr</div>
                            <span className={`inline-block px-2 py-0.5 mt-1.5 rounded text-[9px] font-bold uppercase ${
                              l.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              l.status === 'Lost' ? 'bg-red-50 text-red-700 border-red-200' :
                              l.status === 'Negotiation' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              'bg-amber-50 text-amber-700 border shadow-sm'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Scheduled Chase: <strong className="text-slate-600">{l.followupDate}</strong>
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => generateCfoProposal(l.id)}
                              className="text-[10px] font-bold bg-white hover:bg-blue-50 text-blue-600 px-2 py-1 border border-blue-200 rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles size={11} className="text-blue-500" />
                              <span>Draft AI Proposal</span>
                            </button>

                            {l.status !== 'Converted' && (
                              <button 
                                onClick={() => convertLeadToClientInstance(l)}
                                className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded cursor-pointer"
                              >
                                Convert to Client
                              </button>
                            )}

                            <button 
                              onClick={(e) => handleDeleteLead(l.id, e)}
                              className="text-[10px] font-bold bg-white hover:bg-red-50 text-red-600 px-2 py-1 border border-red-200 rounded cursor-pointer transition-colors"
                              title="Delete Lead"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI PROPOSAL DRAFTER VIEWPORT */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                        <Sparkles className="text-blue-400" size={18} />
                        <h3 className="font-bold text-sm tracking-tight">Gemini AI CFO Proposal Engine</h3>
                      </div>
                      
                      <p className="text-xs text-slate-300 mb-4">
                        Select a lead above to compile an elite, legally structured service contract & cost-saving analysis with customized milestones.
                      </p>

                      {leads.filter(l => l.status !== 'Converted').length > 0 && (
                        <div className="mb-4">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Advisory Account</label>
                          <select 
                            className="bg-slate-800 border border-slate-700 rounded text-xs p-2 text-white outline-none w-full"
                            value={aiProposalClientId}
                            onChange={(e) => setAiProposalClientId(e.target.value)}
                          >
                            {leads.filter(l => l.status !== 'Converted').map(l => (
                              <option key={l.id} value={l.id}>
                                {l.clientName} (${l.totalValue}/yr)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        onClick={() => generateCfoProposal(aiProposalClientId)}
                        disabled={proposalGenerating}
                        className="w-full bg-blue-600 hover:bg-blue-500 transition-all text-white p-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {proposalGenerating ? (
                          <>
                            <RefreshCw className="animate-spin" size={14} />
                            <span>Building custom ROI audits...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Draft Full strategic proposal</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PROPOSAL TEXT BOX */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm min-h-64 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Active Proposal draft</span>
                        {generatedProposalText && (
                          <button 
                            onClick={() => {
                              alert("Draft document saved to Secure DMS Agreements folder.");
                              setDocuments([
                                {
                                  id: `doc-gen-${Date.now()}`,
                                  name: `AI_CFO_Proposal_Draft.pdf`,
                                  clientName: "Royal Palms Resort & Spa",
                                  category: "Agreement",
                                  version: "v1.0 (AI Drafted)",
                                  uploadDate: new Date().toISOString().split('T')[0],
                                  status: "Active",
                                  size: "1.8 MB"
                                },
                                ...documents
                              ]);
                            }}
                            className="text-xs text-blue-600 hover:underline font-bold"
                          >
                            Upload/Save to DMS Vault
                          </button>
                        )}
                      </div>

                      {generatedProposalText ? (
                        <div className="text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto bg-slate-50 p-4 border rounded leading-relaxed custom-scrollbar">
                          {generatedProposalText}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <span className="text-3xl block filter grayscale opacity-60">📑</span>
                          <p className="text-slate-400 text-xs mt-2">No active draft compiled yet. Click the draft trigger button above.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t text-[10px] text-slate-400">
                      Standard pricing calculations are set for 4 active personnel. GST liability mapped automatically.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ==================== TAB 3: CLIENT MASTER DIRECTORY ==================== */}
          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Corporate Master Directory</h1>
                  <p className="text-slate-500 text-xs mt-1">Golden database containing verified GST, PAN, multiple internal personnel contacts & history ledger.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex bg-white border rounded-lg overflow-hidden shrink-0">
                    <button 
                      onClick={() => setIndustryFilter('All')}
                      className={`px-3 py-1.5 text-xs font-bold ${industryFilter === 'All' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      All Sectors
                    </button>
                    <button 
                      onClick={() => setIndustryFilter('Manufacturing')}
                      className={`px-3 py-1.5 text-xs font-bold ${industryFilter === 'Manufacturing' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Manufacturing
                    </button>
                    <button 
                      onClick={() => setIndustryFilter('Hotel/Resort')}
                      className={`px-3 py-1.5 text-xs font-bold ${industryFilter === 'Hotel/Resort' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Hotels
                    </button>
                    <button 
                      onClick={() => setIndustryFilter('Individual FP')}
                      className={`px-3 py-1.5 text-xs font-bold ${industryFilter === 'Individual FP' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Individuals
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowAddClientModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Create Record</span>
                  </button>
                </div>
              </div>

              {/* CLIENT GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clients
                  .filter(c => industryFilter === 'All' || c.industry === industryFilter)
                  .map(client => (
                    <div key={client.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase tracking-wider">
                            {client.industry}
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base mt-2">{client.companyName}</h3>
                        </div>
                         <div className="text-right flex flex-col items-end shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono block">CLIENT-ID:</span>
                          <span className="text-[10px] font-mono bg-slate-50 px-1.5 py-0.2 border rounded block text-slate-600">{client.id}</span>
                          <button 
                            onClick={(e) => handleDeleteClient(client.id, e)}
                            className="text-[10px] text-red-500 hover:text-red-700 font-bold font-mono transition-colors mt-2 cursor-pointer"
                            title="Delete Client Record"
                          >
                            🗑 Delete Record
                          </button>
                        </div>
                      </div>

                      {/* COMPLIANCE META DECK */}
                      <div className="grid grid-cols-2 gap-3 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">PAN Number</span>
                          <span className="text-slate-700 font-bold">{client.pan}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">GSTIN/VAT ID</span>
                          <span className="text-slate-700 font-bold">{client.gst}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2 text-[9px]">Liaison personnel</span>
                        <div className="space-y-2">
                          {client.contacts.map((contact, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/50 p-2 rounded border border-slate-100 text-xs">
                              <div>
                                <span className="font-semibold text-slate-900 block">{contact.name}</span>
                                <span className="text-[10px] text-slate-500">{contact.role}</span>
                              </div>
                              <div className="text-right text-[10px] text-slate-500 font-mono">
                                <div>{contact.phone}</div>
                                <div>{contact.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SERVICE HISTORY */}
                      <div className="mt-4 pt-4 border-t">
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2 text-[9px]">Active CFO Workload History</span>
                        <div className="flex flex-wrap gap-1">
                          {client.serviceHistory.map((sh, idx) => (
                            <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                              ✓ {sh}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t bg-emerald-50/50 p-2.5 rounded text-[11px] text-emerald-800 border border-emerald-100">
                        <strong>Partner Handover Note:</strong> {client.remarks}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}


          {/* ==================== TAB 4: PROJECT COMPLIANCE WORKROOM ==================== */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Compliance Workroom</h1>
                  <p className="text-slate-500 text-xs mt-1">Map compliance checkpoints and financial advisory duties. Toggle statuses and daily activity checks.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Create Checklist Task</span>
                  </button>
                </div>
              </div>

              {/* STAGES MATRIX FILTERS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* INTERACTIVE TASK TABLE/CARDS */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-widest">Active Task Engine Ledger</span>
                      <span className="text-[10px] text-slate-500 font-mono">Real-time update stream</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {tasks.map(t => (
                        <div key={t.id} className="p-5 hover:bg-slate-50/40 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  t.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                  t.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {t.priority} Urgent
                                </span>
                                {t.recurringType !== 'None' && (
                                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-mono">
                                    🔄 {t.recurringType}
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="font-extrabold text-sm text-slate-900 mt-2">{t.title}</h3>
                              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{t.clientName}</span>
                              <p className="text-xs text-slate-600 mt-2">{t.description}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block font-mono">DUE DEADLINE</span>
                              <span className="text-xs font-bold text-slate-900 block font-mono bg-slate-100 px-1.5 py-0.2 rounded">{t.dueDate}</span>
                              
                              <div className="mt-3 flex flex-col items-end gap-1.5">
                                <select 
                                  value={t.stage}
                                  onChange={async (e) => {
                                    const value = e.target.value as ProjectTask['stage'];
                                    if (currentUser) {
                                      try {
                                        await updateDoc(doc(db, 'tasks', t.id), { stage: value });
                                      } catch (err) {
                                        handleFirestoreError(err, OperationType.WRITE, `tasks/${t.id}`);
                                      }
                                    } else {
                                      setTasks(prev => prev.map(pt => pt.id === t.id ? { ...pt, stage: value } : pt));
                                    }
                                  }}
                                  className="text-[11px] font-bold bg-white border rounded p-1 outline-none font-mono cursor-pointer"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Under Review">Under Review</option>
                                  <option value="Completed">Completed</option>
                                </select>

                                <button 
                                  onClick={(e) => handleDeleteTask(t.id, e)}
                                  className="text-[10px] text-red-500 hover:text-red-700 font-bold font-mono transition-colors cursor-pointer mt-1"
                                  title="Delete checkoff task"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* DAILY COLLABORATIVE LOGS SHOWN INSIDE THE CARD */}
                          <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Collaborative Work Update log</span>
                              <button 
                                onClick={() => setSelectedTaskForUpdate(t)}
                                className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                              >
                                ＋ Log Daily Update
                              </button>
                            </div>

                            {t.dailyUpdates.length > 0 ? (
                              <div className="space-y-2 mt-2">
                                {t.dailyUpdates.map(update => (
                                  <div key={update.id} className="text-xs bg-white p-2.5 rounded border border-slate-100 flex items-start justify-between gap-4">
                                    <div>
                                      <strong className="text-slate-800">{update.author}</strong>
                                      <span className="text-slate-400 font-mono text-[9px] ml-1.5">{update.date}</span>
                                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{update.message}</p>
                                    </div>
                                    <span className="text-[9px] text-emerald-500 font-bold">Logged</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">No daily progress checklist updates logged yet. Be the first to coordinate!</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TASK LOGGING SIDE PANEL */}
                <div className="lg:col-span-4">
                  {selectedTaskForUpdate ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-4">
                      <div className="flex items-center justify-between pb-3 border-b mb-4">
                        <span className="font-bold text-xs text-slate-800 uppercase tracking-widest">Post Daily Task Update</span>
                        <button onClick={() => setSelectedTaskForUpdate(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                      </div>

                      <div className="mb-3 text-xs bg-blue-50/50 p-3 rounded text-blue-800 border border-blue-100">
                        <strong>Task:</strong> {selectedTaskForUpdate.title} <br />
                        <strong>Assigned to:</strong> {selectedTaskForUpdate.assignedTo}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Update Notes</label>
                          <textarea 
                            rows={4}
                            className="w-full text-xs p-2.5 border rounded outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                            placeholder="State exactly what has been finished (e.g. reconciled GSTIN raw material credits in ledger or finished resort debt assessment metrics)..."
                            value={newUpdateMessage}
                            onChange={(e) => setNewUpdateMessage(e.target.value)}
                          />
                        </div>

                        <button 
                          onClick={() => handleAddTaskUpdate(selectedTaskForUpdate.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 text-xs font-bold rounded cursor-pointer transition-colors"
                        >
                          Commit progress log to timeline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center sticky top-4">
                      <span className="text-3xl block">📋</span>
                      <h4 className="font-bold text-xs text-slate-700 mt-2">No Active task edit focus</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Select "＋ Log Daily Update" on any checklist in the left-hand ledger view to register modern timeline updates.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}


          {/* ==================== TAB 5: REMINDERS & FOLLOW-UP TRACKER ==================== */}
          {activeTab === 'followups' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Follow-up control room & remIND</h1>
                  <p className="text-slate-500 text-xs mt-1">Decouple client chases from banking/tax partner workflows. Trigger automated text & reminders alerts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CLIENT FOLLOW-UPS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Client chase logs (Statement Collection etc)</h3>
                      <p className="text-slate-400 text-[10px]">Auto-reminders dispatched weekly over email/SMS</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded font-mono font-bold">3 Active list</span>
                  </div>

                  <div className="space-y-3">
                    {followups.filter(f => f.targetType === 'Client').map(f => (
                      <div key={f.id} className="p-4 border rounded-xl bg-slate-50/60 hover:bg-slate-50 relative group">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{f.name}</span>
                              <span className="text-[9px] px-1.5 py-0.1 border bg-white rounded font-semibold text-slate-500">{f.frequency}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{f.description}</p>
                            <span className="text-[10px] text-slate-400 block mt-2 font-mono">Chase scheduled: <strong>{f.scheduledDate}</strong></span>
                          </div>

                          <div className="text-right shrink-0">
                            {f.escalationStatus !== 'Normal' && (
                              <span className="text-[9px] font-bold uppercase text-red-600 bg-red-100/50 border border-red-200 px-1 rounded block">
                                {f.escalationStatus}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* AUTO REMINDER SIMULATOR LINK */}
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="flex gap-1.5 items-center">
                            <button 
                              onClick={() => handleSimulateNotification(`WhatsApp Remind drafted: "Dear ${f.name}, compliance reminder: ${f.description}"`)}
                              className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span>WhatsApp remIND</span>
                            </button>

                            <button 
                              onClick={(e) => handleDeleteFollowUp(f.id, e)}
                              className="border border-slate-250 bg-white hover:bg-slate-50 transition-colors text-slate-500 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                              title="Delete Reminder"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                          
                          {f.status !== 'Completed' && (
                            <button 
                              onClick={async () => {
                                if (currentUser) {
                                  try {
                                    await updateDoc(doc(db, 'followups', f.id), { status: 'Completed', escalationStatus: 'Normal' });
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.WRITE, `followups/${f.id}`);
                                  }
                                } else {
                                  setFollowups(prev => prev.map(fItem => fItem.id === f.id ? { ...fItem, status: 'Completed', escalationStatus: 'Normal' } : fItem));
                                }
                                alert("Chase checklist stamped as COMPLETED");
                              }}
                              className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                            >
                              Mark Completed ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PARTNER FOLLOW-UPS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Service Partners & Regulatory gates</h3>
                      <p className="text-slate-400 text-[10px]">Follow-ups pending with Banks, Chartered Accounts & Auditors</p>
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded font-mono font-bold">2 Active list</span>
                  </div>

                  <div className="space-y-3">
                    {followups.filter(f => f.targetType === 'Partner').map(f => (
                      <div key={f.id} className="p-4 border rounded-xl bg-slate-50/60 hover:bg-slate-50 relative group">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{f.name}</span>
                              <span className="text-[9px] px-1.5 py-0.1 border bg-amber-50 text-amber-800 rounded font-semibold">{f.partnerType}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{f.description}</p>
                            <span className="text-[10px] text-slate-400 block mt-2 font-mono">Chase scheduled: <strong>{f.scheduledDate}</strong></span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${f.status === 'Completed' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>
                              {f.status}
                            </span>
                          </div>
                        </div>

                        {/* ENGAGEMENT BUTTONS */}
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="flex gap-1.5 items-center">
                            <button 
                              onClick={() => handleSimulateNotification(`Email drafted to ${f.email} demanding update on interest subsidy files.`)}
                              className="bg-blue-600 hover:bg-blue-750 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              <span>Trigger Official Email</span>
                            </button>

                            <button 
                              onClick={(e) => handleDeleteFollowUp(f.id, e)}
                              className="border border-slate-250 bg-white hover:bg-slate-50 transition-colors text-slate-500 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                              title="Delete Reminder"
                            >
                              🗑️ Delete
                            </button>
                          </div>

                          {f.status !== 'Completed' && (
                            <button 
                              onClick={async () => {
                                if (currentUser) {
                                  try {
                                    await updateDoc(doc(db, 'followups', f.id), { status: 'Completed', escalationStatus: 'Normal' });
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.WRITE, `followups/${f.id}`);
                                  }
                                } else {
                                  setFollowups(prev => prev.map(fItem => fItem.id === f.id ? { ...fItem, status: 'Completed', escalationStatus: 'Normal' } : fItem));
                                }
                                alert("Regulatory checkpoint stamped as COMPLETED");
                              }}
                              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                            >
                              Stamps Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ==================== TAB 6: DOCUMENT MANAGEMENT SYSTEM ==================== */}
          {activeTab === 'dms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Secure Document System (DMS)</h1>
                  <p className="text-slate-500 text-xs mt-1">Class-A folder directories mapped client-wise. Powered with automatic expiration warnings & renewal keys.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* UPLOAD SIMULATOR */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit">
                  <h3 className="font-extrabold text-xs tracking-wider text-slate-850 uppercase border-b pb-2 mb-4">Secure Cryptographic Upload</h3>
                  
                  <form onSubmit={handleAddDocument} className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Document Identifier Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. MIDC_Tax_Compliance_2026.pdf"
                        className="w-full text-xs p-2.5 border rounded outline-none bg-slate-50 font-mono transition-all focus:ring-1 focus:ring-blue-500"
                        value={uploadedDocName}
                        onChange={(e) => setUploadedDocName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Associated Corporate Client</label>
                      <select 
                        className="w-full text-xs p-2.5 border rounded outline-none bg-slate-50"
                        value={uploadedDocClient}
                        onChange={(e) => setUploadedDocClient(e.target.value)}
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.companyName}>{c.companyName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Filing Category Group</label>
                      <select 
                        className="w-full text-xs p-2.5 border rounded outline-none bg-slate-50"
                        value={uploadedDocCat}
                        onChange={(e) => setUploadedDocCat(e.target.value as any)}
                      >
                        <option value="GST">GST Registration & Filings</option>
                        <option value="Income Tax">Income Tax Registers</option>
                        <option value="Bank">Bank Sanctions & Subsidy Statements</option>
                        <option value="Financial Statement">Periodic Financial Profit & Loss</option>
                        <option value="CFO Analysis">Executive Strategy Memo</option>
                        <option value="Agreement">Signed Retainer Agreement</option>
                      </select>
                    </div>

                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-lg text-center hover:bg-slate-50/50 transition-colors">
                      <span className="text-2xl block mb-1">📁</span>
                      <span className="text-[10px] block text-slate-400 font-medium">Click to attach file or drag-and-drop here</span>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded transition-colors cursor-pointer"
                    >
                      Authenticate Upload to Secure Vault
                    </button>
                  </form>
                </div>

                {/* MANAGED DIRECTORIES VAULT LIST */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-widest">Active Client Cryptographic Drives</span>
                    <span className="text-[10px] text-slate-550 font-semibold">{documents.length} Files protected</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 bg-slate-100 rounded text-slate-600 mt-1">
                            {doc.category === 'GST' ? '🧾' : doc.category === 'Bank' ? '🏦' : '📄'}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-xs text-slate-900 block hover:underline hover:text-blue-600 cursor-pointer">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              <strong>Client:</strong> {doc.clientName} | <strong>Category:</strong> {doc.category}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                              Uploaded: {doc.uploadDate} | Size: {doc.size} | Version: {doc.version}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {doc.expiryDate ? (
                            <div>
                              <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.2 border border-amber-200 rounded block">
                                Expires: {doc.expiryDate}
                              </span>
                              <button 
                                onClick={() => handleSimulateNotification(`Renewal cycle triggered for ${doc.name}`)}
                                className="text-[9px] text-blue-600 hover:underline font-bold mt-1 block"
                              >
                                Trigger Renewal Key
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-100">
                              Verified Active
                            </span>
                          )}

                          <div className="flex flex-col items-end gap-1.5 mt-2">
                            <button 
                              onClick={() => alert(`Downloading "${doc.name}" via authenticated pre-signed AWS S3 block (expires in 15 mins).`)}
                              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer select-none whitespace-nowrap"
                            >
                              <Download size={11} />
                              <span>Retrieve</span>
                            </button>

                            <button 
                              onClick={(e) => handleDeleteDocument(doc.id, e)}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold font-mono transition-colors cursor-pointer"
                              title="Delete document record"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ==================== TAB 7: TEAM WORKLOAD BALANCE ==================== */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personnel Workload Balance</h1>
                  <p className="text-slate-500 text-xs mt-1">Live metrics tracking task speed, workload capacity calculations, and historical advisory logs.</p>
                </div>
              </div>

              {/* HIGHLIGHT: WORKLOAD LEVEL STATS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {team.map(member => (
                  <div key={member.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-950">{member.name}</h4>
                        <span className="text-[10px] text-blue-600 font-mono font-bold block">{member.role}</span>
                      </div>
                      <span className="text-xs bg-slate-100 px-1.5 py-0.2 border rounded font-mono text-slate-500">★ {member.performanceRating}</span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold mb-1">
                        <span>Workload Capacity</span>
                        <span className={`${member.workloadPercentage > 85 ? 'text-red-600 font-bold' : 'text-slate-650'}`}>
                          {member.workloadPercentage}% Loading
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${member.workloadPercentage > 85 ? 'bg-red-500' : member.workloadPercentage > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${member.workloadPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-550 border-t pt-3 flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl border-slate-150">
                      <span>Active checklist: <strong>{member.activeTasks} Projects</strong></span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500">{member.email}</span>
                        <button 
                          onClick={(e) => handleDeleteTeamMember(member.id, e)}
                          className="text-red-500 hover:text-red-700 font-extrabold transition-colors text-[10px] font-mono cursor-pointer uppercase"
                          title="Remove Associate"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DENSITY ACTIVITY TIMELINE LOGS */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-xs tracking-widest text-slate-800 uppercase border-b pb-2">Verified Daily Activity Feed</h3>
                
                <div className="space-y-4">
                  {team.flatMap(m => m.dailyActivityLog.map(log => ({ ...log, memberName: m.name, memberRole: m.role }))).map((activity, idx) => (
                    <div key={idx} className="p-4 border rounded-xl bg-slate-50/65 flex gap-4">
                      <div className="p-2 bg-white rounded border border-slate-200 flex flex-col items-center justify-center shrink-0 w-16 h-16">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Hours spent</span>
                        <span className="text-xl font-extrabold text-slate-900">{activity.hoursWorked}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {activity.memberName} <span className="text-[10px] text-blue-500 font-mono font-normal">({activity.memberRole})</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{activity.date}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 mt-1 block">Task segment: {activity.taskTitle}</span>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          "{activity.logText}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* ==================== TAB 8: BILLING & INVOICING (CLIENT PROFITABILITY) ==================== */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing, Retainers & Client Profitability</h1>
                  <p className="text-slate-500 text-xs mt-1">Cross-reference hours spent on advisory vs client fees to isolate margin drain parameters.</p>
                </div>
              </div>

              {/* RETAINER METRICS / PROFITABILITY ANALYSIS CARDS */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-xs tracking-widest text-slate-850 uppercase border-b pb-2">Client Profitability Matrix</h3>
                <p className="text-slate-500 text-[11px]">
                  <strong>Mathematical Algorithm:</strong> Average Hourly Yield = Retainer Billing Value / Hours Logged by team members. Lower yields flag over-serviced packages.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {invoices.map(inv => {
                    const avgYield = Math.round(inv.amount / inv.costHoursLog);
                    return (
                      <div key={inv.id} className="p-4 border rounded-xl bg-slate-50 relative overflow-hidden flex flex-col justify-between min-h-36">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-wider bg-slate-205 bg-slate-250 text-slate-650 font-bold block">
                              {inv.retainerType}
                            </span>
                            <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${
                              inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                              inv.status === 'Overdue' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          
                          <h4 className="font-extrabold text-sm text-slate-900 mt-2 truncate">{inv.clientName}</h4>
                          <span className="text-[10px] text-slate-400 block font-mono">Inv: {inv.invoiceNumber}</span>
                          <span className="text-lg font-bold text-slate-950 mt-1 block">${inv.amount.toLocaleString()}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t text-[11px] font-mono text-slate-600 flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                          <div>
                            <span>Log: {inv.costHoursLog} hrs</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold ${avgYield > 120 ? 'text-emerald-600' : avgYield > 70 ? 'text-amber-600' : 'text-red-600'}`}>
                              ${avgYield}/hr yield
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DETAILED REVENUE LIST */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-widest font-mono">Invoice Ledger Vault</span>
                  <button 
                    onClick={() => {
                      alert("Simulating export of pending reports in excel formatting to Nikita's mailbox...");
                    }}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    Export Outstanding Reports
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-b">
                      <tr>
                        <th className="px-6 py-3">Invoice ID</th>
                        <th className="px-6 py-3">Client Target Name</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Service Breakdown details</th>
                        <th className="px-6 py-3">Issue Date</th>
                        <th className="px-6 py-3">Due Deadline</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-semibold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">{inv.clientName}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">${inv.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 leading-relaxed">
                            {inv.items?.map((it, idx) => (
                              <div key={idx} className="text-slate-500 text-[10px]">
                                • {it.service} (${it.amount.toLocaleString()})
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 font-mono text-[10px]">{inv.issueDate}</td>
                          <td className="px-6 py-4 font-mono text-[10px]">{inv.dueDate}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              inv.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => handleDeleteInvoice(inv.id, e)}
                              className="text-red-500 hover:text-red-700 font-bold transition-all cursor-pointer text-xs font-mono select-none"
                              title="Delete Invoice Record"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* ==================== TAB 9: STRUCTURAL PLAYGROUND BLUEPRINT ==================== */}
          {activeTab === 'blueprint' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">SaaS Platform Architecture & Master Blueprint</h1>
                  <p className="text-slate-500 text-xs mt-1">
                    An exhaustively detailed blueprint answering all 20 modules requested by the corporate strategists. Filter and explore sections dynamically.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-3 py-1.5 border border-teal-200 rounded font-mono">
                    PRODUCED BY LEAD ARCHITECT
                  </span>
                </div>
              </div>

              {/* CARD BASED SECTIONS LIST WITH DYNAMIC FULL RENDER AND SCROLL MAP */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* NAVIGATION ANCHOR LINKS */}
                <div className="lg:col-span-1 space-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-fit">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-405 text-slate-400 block mb-2">Architect Chapters</span>
                  <div className="space-y-1">
                    {blueprintSections.map(s => (
                      <a 
                        key={s.id}
                        href={`#b-${s.id}`}
                        className="block text-xs font-medium text-slate-650 hover:text-blue-600 p-2 hover:bg-slate-50 rounded transition-all truncate"
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>

                {/* SCROLLABLE RENDERING SYSTEM CONVERTING MARKDOWN */}
                <div className="lg:col-span-3 space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm overflow-y-auto max-h-[70vh] custom-scrollbar">
                  {blueprintSections.map(sec => (
                    <div key={sec.id} id={`b-${sec.id}`} className="border-b pb-8 last:border-b-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 text-[10px] font-bold font-mono tracking-widest uppercase bg-teal-50 text-teal-700 rounded border border-teal-200">
                          {sec.category}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">{sec.title}</h2>
                      </div>
                      
                      <div className="text-xs text-slate-500 font-semibold italic">
                        {sec.summary}
                      </div>

                      <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap mt-2 bg-slate-50/50 p-4 rounded border border-slate-100">
                        {sec.markdownContent}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}


          {/* ==================== TAB 10: SETTINGS & OPERATIONS CONFIGURATION ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings & Controls</h1>
                  <p className="text-slate-500 text-xs mt-1">
                    Manage your outsourced CFO legal profile, change default tax percentages, view consulting partners, and load custom demo datasets.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={resetDemoDataset}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors text-slate-700 px-3 py-1.5 rounded text-xs font-bold font-mono inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔄 Reset Demo Data</span>
                  </button>
                  <button 
                    onClick={clearDatabase}
                    className="bg-red-50 hover:bg-red-150 border border-red-300 transition-all text-red-650 px-3 py-1.5 rounded text-xs font-bold font-mono inline-flex items-center gap-1 cursor-pointer"
                    title="Clear database to allow clean testing from scratch"
                  >
                    <span>🗑️ Clear All Data</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. LEGAL ARCHITECTURE & VAT */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <h3 className="font-extrabold text-xs tracking-wider text-slate-900 uppercase">CFO Business Profile</h3>
                    <span className="text-[9px] bg-blue-50 text-blue-700 font-mono font-bold px-1.5 rounded">Active</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Company Trade Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 bg-slate-50 border rounded outline-none font-medium text-xs focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                        value={businessSettings.businessName}
                        onChange={(e) => setBusinessSettings(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Outsourced CFO Contact Email</label>
                      <input 
                        type="email" 
                        className="w-full p-2.5 bg-slate-50 border rounded outline-none font-medium text-xs focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                        value={businessSettings.contactEmail}
                        onChange={(e) => setBusinessSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Registered GSTIN</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-slate-50 border rounded outline-none font-mono text-[11px] uppercase"
                          value={businessSettings.gstin}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, gstin: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Business PAN Card</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-slate-50 border rounded outline-none font-mono text-[11px] uppercase"
                          value={businessSettings.pan}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, pan: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Local Base Currency symbol</label>
                      <select 
                        className="w-full p-2 bg-slate-50 border text-xs text-slate-700 font-sans outline-none focus:ring-1 focus:ring-blue-500"
                        value={businessSettings.currency}
                        onChange={(e) => setBusinessSettings(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="INR (₹)">INR (₹) - Indian Rupees</option>
                        <option value="USD ($)">USD ($) - US Dollars</option>
                        <option value="EUR (€)">EUR (€) - Euros</option>
                        <option value="GBP (£)">GBP (£) - British Pounds</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. OPERATIONAL DEFAULTS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <h3 className="font-extrabold text-xs tracking-wider text-slate-900 uppercase">Compliance Defaults</h3>
                    <span className="text-[9px] bg-teal-50 text-teal-700 font-mono font-bold px-1.5 rounded">Ruleset</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Base GST Rate preset (%)</label>
                      <input 
                        type="number" 
                        className="w-full p-2.5 bg-slate-50 border rounded outline-none font-mono text-xs focus:ring-1 focus:ring-blue-500"
                        value={businessSettings.taxPercentage}
                        onChange={(e) => setBusinessSettings(prev => ({ ...prev, taxPercentage: Number(e.target.value) }))}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SMS & Email Chase grace period (Days)</label>
                      <input 
                        type="number" 
                        className="w-full p-2.5 bg-slate-50 border rounded outline-none font-mono text-xs focus:ring-1 focus:ring-blue-500"
                        value={businessSettings.reminderGraceDays}
                        onChange={(e) => setBusinessSettings(prev => ({ ...prev, reminderGraceDays: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-lg text-blue-800 border border-blue-100 flex items-start gap-2 leading-relaxed">
                      <span>💡</span>
                      <div>
                        <strong>Reminder Integration Rules</strong> <br />
                        Any follow-up tasks flagged normal will have custom alert links generated. If the grace period is violated, the system triggers priority notification flags on the CFO control room header.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. SCENARIOS PLAYGROUND DESK */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <h3 className="font-extrabold text-xs tracking-wider text-slate-900 uppercase">Demo Scenario Loaders</h3>
                    <span className="text-[9px] bg-purple-50 text-purple-700 font-mono font-bold px-1.5 rounded">Scenarios</span>
                  </div>

                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    Instantly load different business situations to visualize how the platform adapts to disparate customer dynamics.
                  </p>

                  <div className="space-y-2 pt-2">
                    <button 
                      onClick={() => {
                        const scenarioClients: Client[] = [
                          ...clients,
                          {
                            id: `m-sc-${Date.now()}`,
                            companyName: "Hind Heavy Casting Ltd",
                            ownerName: "Subodh Mantri",
                            industry: "Manufacturing",
                            activePlan: "Enterprise Retainer",
                            status: "Active",
                            email: "subodh@hindcasting.co.in",
                            phone: "+91 91223 88100",
                            mcaRegistered: "Yes",
                            gstinVerified: "Yes",
                            panDetails: "AHCHM1142F",
                            incorporationDate: "10 Oct 2005",
                            billingStatus: "Up-to-date"
                          },
                          {
                            id: `m-sc-2-${Date.now()}`,
                            companyName: "Vikas Castings Group",
                            ownerName: "Vikas Chaturvedi",
                            industry: "Manufacturing",
                            activePlan: "Medium Retainer",
                            status: "Active",
                            email: "vikas@vikascastings.in",
                            phone: "+91 97723 54020",
                            mcaRegistered: "Yes",
                            gstinVerified: "Yes",
                            panDetails: "AVCHM8821F",
                            incorporationDate: "15 Jan 1999",
                            billingStatus: "Pending"
                          }
                        ];
                        const scenarioLeads: Lead[] = [
                          ...leads,
                          {
                            id: `l-sc-1`,
                            clientName: "Sudarshan Alloys",
                            industry: "Manufacturing",
                            revenue: "₹180 Crores",
                            contactName: "Ashish Birla",
                            phone: "+91 98230 44021",
                            email: "birla@sudarshanalloys.com",
                            remarks: "Demanding instant project compliance board setup and GST Audit of previous 3 fiscal cycles.",
                            status: "In Progress",
                            totalValue: 45000,
                            assignedPartner: "Rohan Vyas",
                            probability: 85,
                            dateAdded: "Yesterday"
                          }
                        ];
                        const scenarioTasks: ProjectTask[] = [
                          ...tasks,
                          {
                            id: "t-sc-1",
                            title: "GST Auditor Reconcile Cycle",
                            clientName: "Hind Heavy Casting Ltd",
                            description: "Exhaustive tally verification of raw structural iron credits from Q3 import ledger.",
                            assignedTo: "Rohan Vyas",
                            dueDate: "28 May 2026",
                            stage: "Pending",
                            priority: "High",
                            dailyUpdates: []
                          }
                        ];

                        setClients(scenarioClients);
                        setLeads(scenarioLeads);
                        setTasks(scenarioTasks);
                        alert("⚙️ Heavy Manufacturing scenario loaded successfully! Look at the Corporate Directory & Projects board.");
                      }}
                      className="w-full text-left p-3 border rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-3 group shrink-0 cursor-pointer"
                    >
                      <span className="text-lg">🏭</span>
                      <div>
                        <strong className="text-slate-800 text-xs block group-hover:text-blue-600 font-semibold text-left">Load Heavy Manufacturing Portfolios</strong>
                        <span className="text-[10px] text-slate-400 leading-snug">Adds foundry assets, steel-alloy plants, GST tallies, and previous fiscal cycle audits.</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        const scenarioClients: Client[] = [
                          ...clients,
                          {
                            id: `h-sc-${Date.now()}`,
                            companyName: "Goan Sunset Bay Inn",
                            ownerName: "Mario D'Souza",
                            industry: "Hotel/Resort",
                            activePlan: "Advisory Package",
                            status: "Active",
                            email: "mario@goansunset.com",
                            phone: "+91 88301 22910",
                            mcaRegistered: "Yes",
                            gstinVerified: "Yes",
                            panDetails: "AGMDS2201F",
                            incorporationDate: "12 Mar 2012",
                            billingStatus: "Up-to-date"
                          }
                        ];
                        const scenarioFollow: FollowUp[] = [
                          ...followups,
                          {
                            id: "f-sc-1",
                            name: "Goan Sunset Bay Inn",
                            description: "Collect luxury food-beverage tax files and hotel raw inventory purchase books.",
                            status: "Pending",
                            targetType: "Client",
                            frequency: "Twice Weekly",
                            scheduledDate: "Monday, 10 AM",
                            email: "finance@goansunset.com",
                            phone: "+91 88301 22910",
                            escalationStatus: "Orange Alert"
                          }
                        ];

                        setClients(scenarioClients);
                        setFollowups(scenarioFollow);
                        alert("⛱️ Leisure & Hospitality peak scenario loaded! Review Client Chases under Reminders.");
                      }}
                      className="w-full text-left p-3 border rounded-xl hover:bg-slate-55 hover:bg-slate-50 transition-colors flex items-start gap-3 group shrink-0 cursor-pointer"
                    >
                      <span className="text-lg">🏨</span>
                      <div>
                        <strong className="text-slate-800 text-xs block group-hover:text-blue-600 font-semibold text-left">Load Resort & Leisure Scenario</strong>
                        <span className="text-[10px] text-slate-400 leading-snug">Injects luxury resort portfolios, luxury tax compliance chasers, and debt assessments.</span>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* ==================== PORTAL MODALS ==================== */}
        {/* ======================================================== */}

        {/* ONBOARDING & WELCOME TOUR MODAL */}
        {showWelcomeModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 flex flex-col relative overflow-hidden animate-slide-in">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500" />
              
              {/* Outer logo badge */}
              <div className="flex items-center gap-3 mt-2 mb-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                  💎
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">{businessSettings.businessName}</h2>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider font-mono">Enterprise Operations Suite v1.2</span>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-650 leading-relaxed">
                <p>
                  Welcome to the central operations workspace customized specifically for our core team of <strong>4 partner consultants</strong> to streamline advising mid-market manufacturing hubs, luxury hotels, and individual portfolios.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Proactive Control Keys & Features</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">⌨️</span>
                      <div>
                        <strong>Ctrl + K Search Shortcut</strong>
                        <p className="text-[10px] text-slate-500 mt-0.5">Press Ctrl+K (or Cmd+K) anywhere to instantly focus and query global registers.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">⚙️</span>
                      <div>
                        <strong>Settings Scenarios</strong>
                        <p className="text-[10px] text-slate-500 mt-0.5">Toggle different industry presets (Manufacturing or Resorts) dynamically under Settings tab.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-purple-500">📋</span>
                      <div>
                        <strong>Collaborative Audit Timeline</strong>
                        <p className="text-[10px] text-slate-500 mt-0.5">Team members can commit progress updates to each regulatory task with the Log Update button.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500">💬</span>
                      <div>
                        <strong>Simulated WhatsApp Chases</strong>
                        <p className="text-[10px] text-slate-500 mt-0.5">Dispatches custom templated WhatsApp or notification alerts with a single click inside Reminders.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 border border-blue-150/60 bg-blue-50/30 rounded text-slate-600">
                  <span>💡</span>
                  <span>Tip: You can press the <strong>ESC</strong> tab key anytime to quickly dismiss models, filters, or details panels.</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button 
                  onClick={() => setShowWelcomeModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-3 px-6 rounded-lg shadow-md shadow-blue-500/10 cursor-pointer active:scale-95 transition-all outline-none"
                >
                  Enter Operational Dashboard &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD LEAD */}
        {showAddLeadModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-widest">Ingest Lead CRM</h3>
                <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={submitLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Company/Lead Name</label>
                    <input 
                      type="text" 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      placeholder="e.g. Paramount Gear Dynamics"
                      value={leadForm.clientName}
                      onChange={(e) => setLeadForm({...leadForm, clientName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sector Class</label>
                    <select 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      value={leadForm.industry}
                      onChange={(e) => setLeadForm({...leadForm, industry: e.target.value as any})}
                    >
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Hotel/Resort">Hotel & Resort</option>
                      <option value="Individual FP">Individual FP</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Annual Revenue Pool</label>
                    <input 
                      type="text" 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      placeholder="e.g. ₹120 Crores ($15M)"
                      value={leadForm.revenue}
                      onChange={(e) => setLeadForm({...leadForm, revenue: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Deal Valuation ($/yr)</label>
                    <input 
                      type="number" 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      value={leadForm.totalValue}
                      onChange={(e) => setLeadForm({...leadForm, totalValue: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Liaison Contact</label>
                    <input 
                      type="text" 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      placeholder="Dinesh Patel"
                      value={leadForm.contactName}
                      onChange={(e) => setLeadForm({...leadForm, contactName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Phone</label>
                    <input 
                      type="text" 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      placeholder="+91 98123 45678"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      placeholder="dinesh@paramount.in"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Client Problems & Context</label>
                  <textarea 
                    rows={2} 
                    className="w-full text-xs p-2.5 border rounded outline-none"
                    placeholder="Requires monthly product costing audits, cash cycle compression, and GST board reviews."
                    value={leadForm.remarks}
                    onChange={(e) => setLeadForm({...leadForm, remarks: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Scheduled Chase Date</label>
                  <input 
                    type="date" 
                    className="w-full text-xs p-2.5 border rounded outline-none font-mono"
                    value={leadForm.followupDate}
                    onChange={(e) => setLeadForm({...leadForm, followupDate: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddLeadModal(false)}
                    className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Ingest Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD CLIENT */}
        {showAddClientModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-widest">Create Corporate Record</h3>
                <button onClick={() => setShowAddClientModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={submitClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Company Registered Name</label>
                    <input 
                      type="text" 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      placeholder="Apex Manufacturing Ltd."
                      value={clientForm.companyName}
                      onChange={(e) => setClientForm({...clientForm, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sector Classification</label>
                    <select 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      value={clientForm.industry}
                      onChange={(e) => setClientForm({...clientForm, industry: e.target.value as any})}
                    >
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Hotel/Resort">Hotel & Resort</option>
                      <option value="Individual FP">Individual FP</option>
                      <option value="Other">Other Class</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Permanent PAN Card</label>
                    <input 
                      type="text" 
                      className="w-full text-xs p-2.5 border rounded outline-none font-mono"
                      placeholder="e.g. AAACA1234A"
                      value={clientForm.pan}
                      onChange={(e) => setClientForm({...clientForm, pan: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">GSTIN Number</label>
                    <input 
                      type="text" 
                      className="w-full text-xs p-2.5 border rounded outline-none font-mono"
                      placeholder="e.g. 27AAACA1234A1Z1"
                      value={clientForm.gst}
                      onChange={(e) => setClientForm({...clientForm, gst: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border p-3.5 rounded bg-slate-50/50 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block pb-1 border-b">Primary Liaison Contact</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Full Liaison Name</label>
                      <input 
                        type="text" 
                        placeholder="Sanjay Shah" 
                        className="w-full text-xs p-2 border rounded bg-white outline-none"
                        value={clientForm.contactName}
                        onChange={(e) => setClientForm({...clientForm, contactName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Corporate Role</label>
                      <input 
                        type="text" 
                        placeholder="Finance Director" 
                        className="w-full text-xs p-2 border rounded bg-white outline-none"
                        value={clientForm.contactRole}
                        onChange={(e) => setClientForm({...clientForm, contactRole: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Email</label>
                      <input 
                        type="email" 
                        placeholder="sanjay@apexmfg.in" 
                        className="w-full text-xs p-2 border rounded bg-white outline-none"
                        value={clientForm.contactEmail}
                        onChange={(e) => setClientForm({...clientForm, contactEmail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Phone</label>
                      <input 
                        type="text" 
                        placeholder="+91 95555 12121" 
                        className="w-full text-xs p-2 border rounded bg-white outline-none"
                        value={clientForm.contactPhone}
                        onChange={(e) => setClientForm({...clientForm, contactPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Office Registered Physical Address</label>
                  <textarea 
                    rows={2} 
                    className="w-full text-xs p-2.5 border rounded outline-none"
                    placeholder="Plot B-45, MIDC Industrial Area, Pune 411018, Maharashtra"
                    value={clientForm.registeredAddress}
                    onChange={(e) => setClientForm({...clientForm, registeredAddress: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Handover Strategy Note</label>
                  <input 
                    type="text" 
                    className="w-full text-xs p-2.5 border rounded outline-none"
                    placeholder="Highest priority. Cash cycle is currently at 74 days (target: 45 days)."
                    value={clientForm.remarks}
                    onChange={(e) => setClientForm({...clientForm, remarks: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddClientModal(false)}
                    className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Register Company record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD TASK */}
        {showAddTaskModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-widest">Create Checklist Task</h3>
                <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={submitTask} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Task Checkpoint Title</label>
                  <input 
                    type="text" 
                    className="w-full text-xs p-2.5 border rounded outline-none"
                    placeholder="Monthly GSTR-1 & 3B Checkoff"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Client Account</label>
                    <select 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      value={taskForm.clientName}
                      onChange={(e) => setTaskForm({...taskForm, clientName: e.target.value})}
                      required
                    >
                      <option value="">-- Choose Client --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.companyName}>{c.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Assigned Personnel</label>
                    <select 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                    >
                      <option value="">-- Select Member --</option>
                      <option value="Anjali Nair">Anjali Nair (Compliance Analyst)</option>
                      <option value="Rohan Sharma">Rohan Sharma (Senior Associate)</option>
                      <option value="Vikram Sen">Vikram Sen (Finance Associate)</option>
                      <option value="Nikita Oswal">Nikita Oswal (CFO Partner)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Priority Range</label>
                    <select 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Recurrence Rate</label>
                    <select 
                      className="w-full text-xs p-2.5 border rounded outline-none"
                      value={taskForm.recurringType}
                      onChange={(e) => setTaskForm({...taskForm, recurringType: e.target.value as any})}
                    >
                      <option value="None">None</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Deadline</label>
                    <input 
                      type="date" 
                      className="w-full text-xs p-2.5 border rounded outline-none font-mono"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Procedure Instructions Description</label>
                  <textarea 
                    rows={3} 
                    className="w-full text-xs p-2.5 border rounded outline-none"
                    placeholder="Verify input tax ledger and cross-reference with digital signatures on govt gateways."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Dispatch Checkpoint Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
