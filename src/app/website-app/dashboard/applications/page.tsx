"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

/* ─── Types ─── */
interface Application {
  id: string;
  applicant_type: string;
  full_name: string;
  email: string;
  mobile_number: string;
  date_of_birth: string;
  ssn: string;
  driving_license: string;
  marital_status: string;
  current_address: string;
  city: string;
  state: string;
  zip_code: string;
  employer_name: string;
  monthly_income: string;
  specific_request: string;
  housing_requirement: string;
  preferred_move_in: string;
  lease_duration: string;
  university_name: string;
  student_id: string;
  expected_graduation: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  employment_status: string;
  income_source: string;
  has_cosigner: boolean;
  cosigner_name: string;
  cosigner_phone: string;
  cosigner_email: string;
  previous_landlord_name: string;
  landlord_phone: string;
  landlord_address: string;
  reason_for_leaving: string;
  length_of_stay: string;
  ref1_name: string;
  ref1_phone: string;
  ref1_relationship: string;
  ref2_name: string;
  ref2_phone: string;
  ref2_relationship: string;
  consent: boolean;
  gender: string;
  housing_status: string;
  residence_from: string;
  residence_to: string;
  landlord_email: string;
  rent_amount: string;
  supervisor: string;
  employer_address: string;
  employer_phone: string;
  position_held: string;
  date_of_hire: string;
  completed_residence_history: boolean;
  has_pets: boolean;
  pet_type: string;
  pet_weight: string;
  pet_age: string;
  is_esa: boolean;
  vehicle1_make: string;
  vehicle1_year: string;
  vehicle1_color: string;
  vehicle1_plate: string;
  has_second_vehicle: boolean;
  vehicle2_make: string;
  vehicle2_year: string;
  vehicle2_color: string;
  vehicle2_plate: string;
  filed_bankruptcy: boolean;
  evicted_from_tenancy: boolean;
  convicted_felony: boolean;
  arrested_or_convicted: boolean;
  references_info: string;
  agree_terms: boolean;
  signature_name: string;
  signature_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  [key: string]: unknown;
}

interface AppDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_label: string | null;
  uploaded_at: string;
}

/* ─── Constants ─── */
const STATUS_OPTIONS = ["pending", "reviewing", "approved", "denied", "withdrawn"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  denied: "bg-red-50 text-red-700 border-red-200",
  withdrawn: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  pending: "bg-yellow-400",
  reviewing: "bg-blue-400",
  approved: "bg-green-400",
  denied: "bg-red-400",
  withdrawn: "bg-gray-400",
};

const TYPE_LABELS: Record<string, string> = {
  student: "Student",
  professional: "Professional",
  international: "International",
};

const TYPE_COLORS: Record<string, string> = {
  student: "bg-purple-50 text-purple-700 border-purple-200",
  professional: "bg-teal-50 text-teal-700 border-teal-200",
  international: "bg-orange-50 text-orange-700 border-orange-200",
};

type SortKey = "full_name" | "applicant_type" | "mobile_number" | "housing_requirement" | "preferred_move_in" | "status" | "created_at" | "docs";
type SortDir = "asc" | "desc";

/* ─── Helpers ─── */
function formatDate(d: string | undefined | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function maskSSN(ssn: string | undefined | null) {
  if (!ssn) return "—";
  const last4 = ssn.replace(/\D/g, "").slice(-4);
  return last4 ? `***-**-${last4}` : "—";
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return "img";
  if (type === "application/pdf") return "pdf";
  if (type.includes("word")) return "doc";
  if (type.includes("excel") || type.includes("spreadsheet")) return "xls";
  return "file";
}

function isPreviewable(type: string) {
  return type === "application/pdf" || type.startsWith("image/");
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─── SVG Icons ─── */
function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
      </svg>
    );
  }
  return dir === "asc" ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function PaperClipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ─── Sub-components ─── */
function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400 mb-0.5 truncate">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">{value ?? "—"}</p>
    </div>
  );
}

function SectionHeading({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <span className="text-gray-400">{icon}</span>
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h4>
    </div>
  );
}

function StatCard({ label, count, color, dotColor, onClick, active }: { label: string; count: number; color: string; dotColor: string; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[140px] p-4 rounded-2xl border text-left transition-all ${
        active ? `${color} border-current ring-2 ring-current/20` : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
    </button>
  );
}

/* ─── Main Component ─── */
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [previewDoc, setPreviewDoc] = useState<AppDocument | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  /* ── Data fetching ── */
  const fetchDocuments = useCallback(async (applicationId: string) => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/documents?application_id=${applicationId}`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const openApplication = useCallback((app: Application) => {
    setSelected(app);
    setPreviewDoc(null);
    fetchDocuments(app.id);
    // Load notes from localStorage
    try {
      const stored = localStorage.getItem(`app_notes_${app.id}`);
      setNoteText(stored || "");
    } catch {
      setNoteText("");
    }
    setNoteSaved(false);
  }, [fetchDocuments]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      const apps: Application[] = Array.isArray(data) ? data : [];
      setApplications(apps);
      // Fetch doc counts for all apps
      for (const app of apps) {
        fetch(`/api/documents?application_id=${app.id}`)
          .then((r) => r.json())
          .then((docs) => {
            if (Array.isArray(docs)) {
              setDocCounts((prev) => ({ ...prev, [app.id]: docs.length }));
            }
          })
          .catch(() => {});
      }
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    // Load all notes from localStorage
    try {
      const allNotes: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("app_notes_")) {
          allNotes[key.replace("app_notes_", "")] = localStorage.getItem(key) || "";
        }
      }
      setNotes(allNotes);
    } catch {
      /* noop */
    }
  }, [fetchApplications]);

  /* ── Actions ── */
  const updateStatus = useCallback(async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
        setSelected((prev) => (prev?.id === id ? { ...prev, ...updated } : prev));
      }
    } finally {
      setUpdating(null);
    }
  }, []);

  const softDelete = useCallback(async (app: Application) => {
    setDeleting(app.id);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== app.id));
        setSelected(null);
        setConfirmDelete(null);
      }
    } finally {
      setDeleting(null);
    }
  }, []);

  const saveNote = useCallback(() => {
    if (!selected) return;
    try {
      localStorage.setItem(`app_notes_${selected.id}`, noteText);
      setNotes((prev) => ({ ...prev, [selected.id]: noteText }));
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      /* noop */
    }
  }, [selected, noteText]);

  const exportCSV = useCallback(() => {
    const headers = [
      "Name", "Email", "Phone", "Type", "Status", "Housing", "Move-in",
      "University", "Employer", "Monthly Income", "Submitted",
    ];
    const rows = filtered.map((a) => [
      a.full_name, a.email, a.mobile_number || "", a.applicant_type || "",
      a.status, a.housing_requirement || "", a.preferred_move_in || "",
      a.university_name || "", a.employer_name || "", a.monthly_income || "",
      a.created_at ? new Date(a.created_at).toISOString() : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, filter, statusFilter, search, sortKey, sortDir, docCounts]);

  /* ── Filtering & sorting ── */
  const filtered = useMemo(() => {
    const result = applications.filter((a) => {
      if (filter !== "all" && a.applicant_type !== filter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.full_name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.mobile_number?.includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortKey === "docs") {
        aVal = docCounts[a.id] || 0;
        bVal = docCounts[b.id] || 0;
      } else {
        aVal = (a[sortKey] as string) || "";
        bVal = (b[sortKey] as string) || "";
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, filter, statusFilter, search, sortKey, sortDir, docCounts]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const reviewing = applications.filter((a) => a.status === "reviewing").length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const denied = applications.filter((a) => a.status === "denied").length;
    const thisWeek = applications.filter((a) => isThisWeek(a.created_at)).length;
    return { total, pending, reviewing, approved, denied, thisWeek };
  }, [applications]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} application{filtered.length !== 1 ? "s" : ""} found
            {stats.thisWeek > 0 && (
              <span className="ml-2 text-blue-600 font-medium">&middot; {stats.thisWeek} new this week</span>
            )}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <DownloadIcon />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-3">
        <StatCard
          label="Total"
          count={stats.total}
          color="bg-gray-50 text-gray-700"
          dotColor="bg-gray-400"
          onClick={() => setStatusFilter("all")}
          active={statusFilter === "all"}
        />
        <StatCard
          label="Pending"
          count={stats.pending}
          color="bg-yellow-50 text-yellow-700"
          dotColor="bg-yellow-400"
          onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
          active={statusFilter === "pending"}
        />
        <StatCard
          label="Reviewing"
          count={stats.reviewing}
          color="bg-blue-50 text-blue-700"
          dotColor="bg-blue-400"
          onClick={() => setStatusFilter(statusFilter === "reviewing" ? "all" : "reviewing")}
          active={statusFilter === "reviewing"}
        />
        <StatCard
          label="Approved"
          count={stats.approved}
          color="bg-green-50 text-green-700"
          dotColor="bg-green-400"
          onClick={() => setStatusFilter(statusFilter === "approved" ? "all" : "approved")}
          active={statusFilter === "approved"}
        />
        <StatCard
          label="Denied"
          count={stats.denied}
          color="bg-red-50 text-red-700"
          dotColor="bg-red-400"
          onClick={() => setStatusFilter(statusFilter === "denied" ? "all" : "denied")}
          active={statusFilter === "denied"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Types</option>
          <option value="student">Student</option>
          <option value="professional">Professional</option>
          <option value="international">International</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{capitalize(s)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0h1.5m-1.5 3H9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-sm">No applications found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortableHeader label="Applicant" sortKey="full_name" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Type" sortKey="applicant_type" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Phone" sortKey="mobile_number" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Housing" sortKey="housing_requirement" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Move-in" sortKey="preferred_move_in" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Status" sortKey="status" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Submitted" sortKey="created_at" currentKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Docs</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openApplication(app)}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-900">{app.full_name}</p>
                      <p className="text-xs text-gray-400">{app.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${TYPE_COLORS[app.applicant_type] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {TYPE_LABELS[app.applicant_type] || app.applicant_type || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{app.mobile_number || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{app.housing_requirement || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{app.preferred_move_in ? formatDate(app.preferred_move_in) : "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[app.status] || "bg-gray-50 text-gray-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[app.status] || "bg-gray-400"}`} />
                        {capitalize(app.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{formatDate(app.created_at)}</td>
                    <td className="px-4 py-3.5 text-center">
                      {(docCounts[app.id] || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                          <PaperClipIcon />
                          {docCounts[app.id]}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          disabled={updating === app.id}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{capitalize(s)}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setConfirmDelete(app)}
                          title="Move to Recycle Bin"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Slide-over Detail Panel ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/30 transition-opacity" />
          <div
            className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{selected.full_name}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${STATUS_COLORS[selected.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[selected.status]}`} />
                    {capitalize(selected.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{selected.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  title="Print Application"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>
                </button>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="px-6 py-6 space-y-8">
              {/* Section 1: Personal Information */}
              <section>
                <SectionHeading
                  title="Personal Information"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailField label="Full Name" value={selected.full_name} />
                  <DetailField label="Email" value={selected.email} />
                  <DetailField label="Phone" value={selected.mobile_number} />
                  <DetailField label="Date of Birth" value={formatDate(selected.date_of_birth)} />
                  <DetailField label="SSN" value={maskSSN(selected.ssn)} />
                  <DetailField label="Driving License" value={selected.driving_license} />
                  <DetailField label="Marital Status" value={selected.marital_status ? capitalize(selected.marital_status) : "—"} />
                  <DetailField label="Applicant Type" value={TYPE_LABELS[selected.applicant_type] || selected.applicant_type} />
                </div>
              </section>

              {/* Section 2: Address & Education */}
              <section>
                <SectionHeading
                  title="Address & Education"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 sm:col-span-3">
                    <DetailField label="Current Address" value={[selected.current_address, selected.city, selected.state, selected.zip_code].filter(Boolean).join(", ") || "—"} />
                  </div>
                  {(selected.applicant_type === "student" || selected.applicant_type === "international") && (
                    <>
                      <DetailField label="University" value={selected.university_name} />
                      <DetailField label="Student ID" value={selected.student_id} />
                      <DetailField label="Expected Graduation" value={formatDate(selected.expected_graduation)} />
                    </>
                  )}
                  <DetailField label="Emergency Contact" value={selected.emergency_contact_name} />
                  <DetailField label="Emergency Phone" value={selected.emergency_contact_phone} />
                  <DetailField label="Relationship" value={selected.emergency_contact_relationship} />
                </div>
              </section>

              {/* Section 3: Employment & Income */}
              <section>
                <SectionHeading
                  title="Employment & Income"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailField label="Employment Status" value={selected.employment_status ? capitalize(selected.employment_status) : "—"} />
                  <DetailField label="Employer" value={selected.employer_name} />
                  <DetailField label="Monthly Income" value={selected.monthly_income ? `$${Number(selected.monthly_income).toLocaleString()}` : "—"} />
                  <DetailField label="Income Source" value={selected.income_source} />
                </div>
                {selected.has_cosigner && (
                  <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Co-signer Information</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <DetailField label="Co-signer Name" value={selected.cosigner_name} />
                      <DetailField label="Co-signer Phone" value={selected.cosigner_phone} />
                      <DetailField label="Co-signer Email" value={selected.cosigner_email} />
                    </div>
                  </div>
                )}
              </section>

              {/* Section 4: References & Rental History */}
              <section>
                <SectionHeading
                  title="References & Rental History"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  }
                />
                {/* Previous Landlord */}
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Previous Landlord</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <DetailField label="Name" value={selected.previous_landlord_name} />
                    <DetailField label="Phone" value={selected.landlord_phone} />
                    <DetailField label="Address" value={selected.landlord_address} />
                    <DetailField label="Reason for Leaving" value={selected.reason_for_leaving} />
                    <DetailField label="Length of Stay" value={selected.length_of_stay} />
                  </div>
                </div>
                {/* References */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Reference 1</p>
                    <DetailField label="Name" value={selected.ref1_name} />
                    <div className="mt-2"><DetailField label="Phone" value={selected.ref1_phone} /></div>
                    <div className="mt-2"><DetailField label="Relationship" value={selected.ref1_relationship} /></div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Reference 2</p>
                    <DetailField label="Name" value={selected.ref2_name} />
                    <div className="mt-2"><DetailField label="Phone" value={selected.ref2_phone} /></div>
                    <div className="mt-2"><DetailField label="Relationship" value={selected.ref2_relationship} /></div>
                  </div>
                </div>
              </section>

              {/* Section 5: Residence Info (Professional apps) */}
              {(selected.housing_status || selected.residence_from || selected.landlord_email) && (
                <section>
                  <SectionHeading
                    title="Residence Details"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <DetailField label="Housing Status" value={selected.housing_status} />
                    <DetailField label="From" value={formatDate(selected.residence_from as string)} />
                    <DetailField label="To" value={formatDate(selected.residence_to as string)} />
                    <DetailField label="Landlord Email" value={selected.landlord_email} />
                    <DetailField label="Rent Amount" value={selected.rent_amount ? `$${selected.rent_amount}` : undefined} />
                  </div>
                </section>
              )}

              {/* Section 5b: General Info (Pets) */}
              {(selected.has_pets !== undefined && selected.has_pets !== null) && (
                <section>
                  <SectionHeading
                    title="General Information"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <DetailField label="Gender" value={selected.gender} />
                    <DetailField label="Has Pets" value={selected.has_pets ? "Yes" : "No"} />
                    {selected.has_pets && (
                      <>
                        <DetailField label="Pet Type" value={selected.pet_type} />
                        <DetailField label="Pet Weight" value={selected.pet_weight} />
                        <DetailField label="Pet Age" value={selected.pet_age} />
                        <DetailField label="ESA" value={selected.is_esa ? "Yes" : "No"} />
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Section 5c: Vehicle Info */}
              {selected.vehicle1_make && (
                <section>
                  <SectionHeading
                    title="Vehicle Information"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-3.007-3.007a3 3 0 00-2.12-.879H6.75A2.25 2.25 0 004.5 10.5v6" /></svg>}
                  />
                  <div className="p-3 bg-gray-50 rounded-xl mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Vehicle 1</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <DetailField label="Make" value={selected.vehicle1_make} />
                      <DetailField label="Year" value={selected.vehicle1_year} />
                      <DetailField label="Color" value={selected.vehicle1_color} />
                      <DetailField label="Plate" value={selected.vehicle1_plate} />
                    </div>
                  </div>
                  {selected.has_second_vehicle && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Vehicle 2</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <DetailField label="Make" value={selected.vehicle2_make} />
                        <DetailField label="Year" value={selected.vehicle2_year} />
                        <DetailField label="Color" value={selected.vehicle2_color} />
                        <DetailField label="Plate" value={selected.vehicle2_plate} />
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Section 5d: Background Check */}
              {(selected.filed_bankruptcy !== undefined && selected.filed_bankruptcy !== null) && (
                <section>
                  <SectionHeading
                    title="Background Check"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${selected.filed_bankruptcy ? "bg-red-50" : "bg-green-50"}`}>
                      <DetailField label="Filed Bankruptcy" value={selected.filed_bankruptcy ? "Yes" : "No"} />
                    </div>
                    <div className={`p-3 rounded-xl ${selected.evicted_from_tenancy ? "bg-red-50" : "bg-green-50"}`}>
                      <DetailField label="Evicted from Tenancy" value={selected.evicted_from_tenancy ? "Yes" : "No"} />
                    </div>
                    <div className={`p-3 rounded-xl ${selected.convicted_felony ? "bg-red-50" : "bg-green-50"}`}>
                      <DetailField label="Convicted of Felony" value={selected.convicted_felony ? "Yes" : "No"} />
                    </div>
                    <div className={`p-3 rounded-xl ${selected.arrested_or_convicted ? "bg-red-50" : "bg-green-50"}`}>
                      <DetailField label="Arrested/Convicted" value={selected.arrested_or_convicted ? "Yes" : "No"} />
                    </div>
                  </div>
                </section>
              )}

              {/* Section 5e: Authorization */}
              {selected.signature_name && (
                <section>
                  <SectionHeading
                    title="Authorization & Signature"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <DetailField label="Agreed to Terms" value={selected.agree_terms ? "Yes" : "No"} />
                    <DetailField label="Electronic Signature" value={selected.signature_name} />
                    <DetailField label="Signature Date" value={formatDate(selected.signature_date as string)} />
                  </div>
                </section>
              )}

              {/* Section 6: Housing Preferences */}
              <section>
                <SectionHeading
                  title="Housing Preferences"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                    </svg>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailField label="Housing Requirement" value={selected.housing_requirement} />
                  <DetailField label="Preferred Move-in" value={formatDate(selected.preferred_move_in)} />
                  <DetailField label="Lease Duration" value={selected.lease_duration} />
                  <div className="col-span-2 sm:col-span-3">
                    <DetailField label="Special Requests" value={selected.specific_request} />
                  </div>
                </div>
              </section>

              {/* Section 6: Documents */}
              <section>
                <SectionHeading
                  title={`Documents${documents.length > 0 ? ` (${documents.length})` : ""}`}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  }
                />
                {loadingDocs ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Loading documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-gray-400 py-3">No documents uploaded with this application.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => {
                      const icon = getFileIcon(doc.file_type);
                      const iconStyles: Record<string, string> = {
                        pdf: "bg-red-100 text-red-600",
                        img: "bg-blue-100 text-blue-600",
                        doc: "bg-purple-100 text-purple-600",
                        xls: "bg-green-100 text-green-600",
                        file: "bg-gray-100 text-gray-600",
                      };
                      return (
                        <div key={doc.id}>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${iconStyles[icon]}`}>
                              {icon.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                              <p className="text-xs text-gray-400">
                                {doc.document_label || "Document"} &middot; {formatFileSize(doc.file_size)}
                              </p>
                            </div>
                            {isPreviewable(doc.file_type) && (
                              <button
                                onClick={() => setPreviewDoc(previewDoc?.id === doc.id ? null : doc)}
                                className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shrink-0"
                              >
                                {previewDoc?.id === doc.id ? "Hide" : "Preview"}
                              </button>
                            )}
                            <a
                              href={`/api/documents/${doc.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
                            >
                              View
                            </a>
                            <a
                              href={`/api/documents/${doc.id}?download=1`}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
                            >
                              Download
                            </a>
                          </div>
                          {/* Inline preview */}
                          {previewDoc?.id === doc.id && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                              {doc.file_type === "application/pdf" ? (
                                <iframe
                                  src={`/api/documents/${doc.id}`}
                                  className="w-full h-[400px]"
                                  title={doc.file_name}
                                />
                              ) : doc.file_type.startsWith("image/") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`/api/documents/${doc.id}`}
                                  alt={doc.file_name}
                                  className="w-full max-h-[400px] object-contain"
                                />
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Section 7: Status & Actions */}
              <section>
                <SectionHeading
                  title="Status & Actions"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />

                {/* Current status */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-500">Current Status:</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[selected.status]}`}>
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[selected.status]}`} />
                    {capitalize(selected.status)}
                  </span>
                </div>

                {/* Status buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={updating === selected.id || selected.status === s}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        selected.status === s
                          ? STATUS_COLORS[s] + " ring-2 ring-current/20"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {capitalize(s)}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Internal Notes</label>
                  <textarea
                    value={noteText}
                    onChange={(e) => { setNoteText(e.target.value); setNoteSaved(false); }}
                    placeholder="Add private notes about this application..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={saveNote}
                      className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Note
                    </button>
                    {noteSaved && (
                      <span className="text-xs text-green-600 font-medium">Saved successfully</span>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-xs text-gray-400">
                  <span>Submitted: {formatDate(selected.created_at)}</span>
                  <span>Last Updated: {formatDate(selected.updated_at)}</span>
                </div>

                {/* Delete */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { setSelected(null); setConfirmDelete(selected); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Move to Recycle Bin
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <TrashIcon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Move to Recycle Bin?</h3>
              <p className="text-sm text-gray-500 mb-6">
                <strong>{confirmDelete.full_name}</strong>&apos;s application will be moved to the Recycle Bin. You can restore it later or permanently delete it.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => softDelete(confirmDelete)}
                  disabled={deleting === confirmDelete.id}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Move to Recycle Bin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ─── Sortable Header ─── */
function SortableHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th className="text-left px-4 py-3">
      <button
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 font-semibold text-gray-500 text-xs uppercase tracking-wider hover:text-gray-700 transition-colors"
      >
        {label}
        <SortIcon active={currentKey === sortKey} dir={dir} />
      </button>
    </th>
  );
}
