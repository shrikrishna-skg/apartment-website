"use client";

import { useEffect, useMemo, useState } from "react";
import SonarToast, { useSonarToast } from "@/components/ui/SonarToast";
import DateRangeFilter, { DateRange, defaultDateRange, filterByDateRange } from "@/components/ui/DateRangeFilter";

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

interface MaintenancePhoto {
  storage_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at?: string;
}

interface ActivityEntry {
  at: string;
  message: string;
  by?: string | null;
}

interface MaintenanceRequest {
  id: string;
  property_name: string | null;
  apartment: string;
  full_name: string;
  email: string;
  phone: string | null;
  category: string | null;
  urgency: string;
  description: string;
  preferred_date: string | null;
  preferred_time: string | null;
  entry_notes: string | null;
  photos: MaintenancePhoto[] | null;
  status: string;
  created_at: string;
  resolution_notes: string | null;
  staff_notes: string | null;
  activity_log: ActivityEntry[] | null;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const PHOTO_BUCKET = "application-documents";
function publicPhotoUrl(storage_path: string) {
  if (!SUPABASE_URL) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${storage_path}`;
}

const STATUS_OPTIONS = ["open", "partial", "resolved"];
const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700 border-red-200",
  partial: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  partial: "Partially Completed",
  resolved: "Completed",
};
// Statuses that capture customer-facing notes + an optional tenant email.
const NOTE_STATUSES = ["partial", "resolved"];

const URGENCY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  emergency: "bg-red-100 text-red-700",
};

export default function MaintenancePage() {
  const { toast, setToast, showToast } = useSonarToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MaintenanceRequest | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ req: MaintenanceRequest; status: string } | null>(null);
  const [modalNotes, setModalNotes] = useState("");
  const [modalStaffNotes, setModalStaffNotes] = useState("");
  const [modalSendEmail, setModalSendEmail] = useState(true);
  const [staffNotesDraft, setStaffNotesDraft] = useState("");
  const [savingStaffNotes, setSavingStaffNotes] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const initialNewRequest = {
    property_name: "",
    apartment: "",
    full_name: "",
    email: "",
    phone: "",
    category: "",
    urgency: "medium",
    description: "",
    preferred_date: "",
    preferred_time: "",
    entry_notes: "",
  };
  const [newRequest, setNewRequest] = useState(initialNewRequest);

  const handleCreate = async () => {
    setCreateError("");
    if (
      !newRequest.apartment.trim() ||
      !newRequest.full_name.trim() ||
      !newRequest.email.trim() ||
      !newRequest.description.trim()
    ) {
      setCreateError("Apartment, name, email, and description are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/maintenance/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create request");
      }
      const created = await res.json();
      setRequests((prev) => [created, ...prev]);
      setShowCreate(false);
      setNewRequest(initialNewRequest);
      showToast("Request created. Confirmation email sent to tenant.");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    setStaffNotesDraft(selected?.staff_notes || "");
  }, [selected]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/maintenance");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const requestStatusChange = (req: MaintenanceRequest, status: string) => {
    if (NOTE_STATUSES.includes(status)) {
      setModalNotes(req.resolution_notes || "");
      setModalStaffNotes(req.staff_notes || "");
      setModalSendEmail(true);
      setStatusModal({ req, status });
      return;
    }
    updateStatus(req.id, { status });
  };

  const updateStatus = async (
    id: string,
    payload: { status?: string; resolution_notes?: string; staff_notes?: string; send_email?: boolean }
  ) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
        if (selected?.id === id) setSelected({ ...selected, ...updated });
        if (payload.status && payload.send_email) {
          showToast(`Status set to ${STATUS_LABELS[payload.status]} — email sent to tenant`);
        } else if (payload.status) {
          showToast(`Status updated to ${STATUS_LABELS[payload.status] || payload.status}`);
        }
      }
    } finally {
      setUpdating(null);
      setStatusModal(null);
      setModalNotes("");
      setModalStaffNotes("");
    }
  };

  const saveStaffNotes = async (req: MaintenanceRequest) => {
    setSavingStaffNotes(true);
    try {
      const res = await fetch(`/api/maintenance/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_notes: staffNotesDraft }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, ...updated } : r)));
        if (selected?.id === req.id) setSelected({ ...selected, ...updated });
        showToast("Staff notes saved");
      }
    } finally {
      setSavingStaffNotes(false);
    }
  };

  const softDelete = async (req: MaintenanceRequest) => {
    setDeleting(req.id);
    try {
      const res = await fetch(`/api/maintenance/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== req.id));
        setSelected(null);
        setConfirmDelete(null);
      }
    } finally {
      setDeleting(null);
    }
  };

  const stats = useMemo(() => {
    const total = requests.length;
    const open = requests.filter((r) => r.status === "open").length;
    const partial = requests.filter((r) => r.status === "partial").length;
    const resolved = requests.filter((r) => r.status === "resolved").length;
    return { total, open, partial, resolved };
  }, [requests]);

  const filtersActive =
    statusFilter !== "all" ||
    urgencyFilter !== "all" ||
    search.trim() !== "" ||
    dateRange.preset !== defaultDateRange.preset;

  const clearFilters = () => {
    setStatusFilter("all");
    setUrgencyFilter("all");
    setSearch("");
    setDateRange(defaultDateRange);
  };

  const baseFiltered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.full_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.apartment?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });
  const filtered = filterByDateRange(baseFiltered, (r) => r.created_at, dateRange);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  const formatDateTime = (d: string) => {
    try {
      return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    } catch {
      return d;
    }
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(d);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} request{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Request
        </button>
      </div>

      {/* Stats */}
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
          label="Open"
          count={stats.open}
          color="bg-red-50 text-red-700"
          dotColor="bg-red-400"
          onClick={() => setStatusFilter(statusFilter === "open" ? "all" : "open")}
          active={statusFilter === "open"}
        />
        <StatCard
          label="Partially Completed"
          count={stats.partial}
          color="bg-blue-50 text-blue-700"
          dotColor="bg-blue-400"
          onClick={() => setStatusFilter(statusFilter === "partial" ? "all" : "partial")}
          active={statusFilter === "partial"}
        />
        <StatCard
          label="Completed"
          count={stats.resolved}
          color="bg-green-50 text-green-700"
          dotColor="bg-green-400"
          onClick={() => setStatusFilter(statusFilter === "resolved" ? "all" : "resolved")}
          active={statusFilter === "resolved"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, apartment, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Urgencies</option>
          <option value="emergency">Emergency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Request List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-600 text-sm">No maintenance requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all cursor-pointer ${
                req.urgency === "emergency" ? "border-l-4 border-l-red-500" : req.urgency === "high" ? "border-l-4 border-l-orange-400" : ""
              }`}
              onClick={() => setSelected(req)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">Apt {req.apartment}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${URGENCY_COLORS[req.urgency] || "bg-gray-100 text-gray-600"}`}>
                      {req.urgency}
                    </span>
                    {req.category && (
                      <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {req.category}
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{req.full_name} &middot; {req.email}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{req.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-600">{timeAgo(req.created_at)}</p>
                  <select
                    value={req.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      requestStatusChange(req, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={updating === req.id}
                    className="mt-2 text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(req); }}
                    title="Delete"
                    className="mt-2 p-1.5 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Apt {selected.apartment}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${URGENCY_COLORS[selected.urgency]}`}>
                    {selected.urgency}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{selected.full_name} &middot; {selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Property</p>
                  <p className="text-sm font-medium text-gray-900">{selected.property_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Category</p>
                  <p className="text-sm font-medium text-gray-900">{selected.category || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{selected.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Preferred Date</p>
                  <p className="text-sm font-medium text-gray-900">{selected.preferred_date ? formatDate(selected.preferred_date) : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Preferred Time</p>
                  <p className="text-sm font-medium text-gray-900">{selected.preferred_time || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-600 mb-0.5">Submitted</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selected.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Description</p>
                <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">{selected.description}</div>
              </div>
              {selected.entry_notes && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Entry Notes</p>
                  <div className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl p-4 whitespace-pre-wrap">{selected.entry_notes}</div>
                </div>
              )}
              {Array.isArray(selected.photos) && selected.photos.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Attachments ({selected.photos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.photos.map((p, idx) => {
                      const url = publicPhotoUrl(p.storage_path);
                      const isImage = (p.file_type || "").startsWith("image/");
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors"
                          title={p.file_name}
                        >
                          {isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={p.file_name} className="w-full h-24 object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-24 flex flex-col items-center justify-center bg-gray-50 text-gray-500 p-2">
                              <span className="text-[10px] font-semibold uppercase tracking-wide">{(p.file_type || "file").split("/").pop()}</span>
                              <span className="text-[10px] mt-1 truncate w-full text-center">{p.file_name}</span>
                            </div>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              {selected.resolution_notes && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {selected.status === "partial" ? "Progress Notes" : "Completion Notes"}
                    <span className="text-gray-400 font-normal"> (shared with tenant)</span>
                  </p>
                  <div className="text-sm text-gray-700 bg-green-50 border border-green-100 rounded-xl p-4 whitespace-pre-wrap">{selected.resolution_notes}</div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-xs font-medium text-gray-600">Internal Staff Notes</p>
                  <span className="text-[10px] text-gray-400">— staff only, never shown to tenant</span>
                </div>
                <textarea
                  value={staffNotesDraft}
                  onChange={(e) => setStaffNotesDraft(e.target.value)}
                  rows={3}
                  placeholder="Notes for staff only. Not shared with the tenant."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-300 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => saveStaffNotes(selected)}
                    disabled={savingStaffNotes || staffNotesDraft === (selected.staff_notes || "")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-800 hover:bg-gray-900 transition-colors disabled:opacity-40"
                  >
                    {savingStaffNotes ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => requestStatusChange(selected, s)}
                      disabled={updating === selected.id || selected.status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                        selected.status === s ? STATUS_COLORS[s] : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-3">Activity Log</p>
                {Array.isArray(selected.activity_log) && selected.activity_log.length > 0 ? (
                  <ol className="space-y-3">
                    {[...selected.activity_log].reverse().map((a, idx) => (
                      <li key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-2 h-2 mt-1 rounded-full bg-blue-400 shrink-0" />
                          {idx < selected.activity_log!.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
                        </div>
                        <div className="pb-1">
                          <p className="text-sm text-gray-800 leading-tight">{a.message}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{formatDateTime(a.at)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-gray-400">No activity recorded yet.</p>
                )}
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => { setSelected(null); setConfirmDelete(selected); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Move to Recycle Bin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Move to Recycle Bin?</h3>
              <p className="text-sm text-gray-500 mb-6">Maintenance request for <strong>Apt {confirmDelete.apartment}</strong> will be moved to the Recycle Bin.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => softDelete(confirmDelete)} disabled={deleting === confirmDelete.id} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">{deleting ? "Deleting..." : "Move to Recycle Bin"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {statusModal && (() => {
        const isResolved = statusModal.status === "resolved";
        const busy = updating === statusModal.req.id;
        const confirmLabel = isResolved ? "Mark Completed" : "Mark Partially Completed";
        const iconWrap = isResolved ? "bg-green-50" : "bg-blue-50";
        const iconColor = isResolved ? "text-green-600" : "text-blue-600";
        const notesFocus = isResolved ? "focus:ring-green-500/20 focus:border-green-400" : "focus:ring-blue-500/20 focus:border-blue-400";
        return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={() => !busy && setStatusModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${iconWrap} flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isResolved ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                {isResolved ? "Mark as Completed?" : "Mark as Partially Completed?"}
              </h3>
              <p className="text-sm text-gray-500 mb-5 text-center">
                This will set <strong>Apt {statusModal.req.apartment}</strong> to <strong>{STATUS_LABELS[statusModal.status]}</strong>
                {modalSendEmail ? <> and email <strong>{statusModal.req.email}</strong></> : null}.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Customer Notes <span className="text-gray-400 font-normal">(optional — shared with tenant{modalSendEmail ? " by email" : ""})</span>
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows={3}
                  placeholder={isResolved ? "e.g. Replaced the kitchen faucet cartridge. Please run cold water for a minute before use." : "e.g. Replaced the faucet; waiting on a part for the under-sink leak. Will return Friday."}
                  className={`w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 ${notesFocus} resize-none`}
                  disabled={busy}
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Internal Staff Notes <span className="text-gray-400 font-normal">(private — never shown to tenant)</span>
                </label>
                <textarea
                  value={modalStaffNotes}
                  onChange={(e) => setModalStaffNotes(e.target.value)}
                  rows={2}
                  placeholder="Private notes for staff only..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 resize-none"
                  disabled={busy}
                />
              </div>
              <label className="flex items-center gap-2 mb-6 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalSendEmail}
                  onChange={(e) => setModalSendEmail(e.target.checked)}
                  disabled={busy}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Email the tenant a {isResolved ? "completion notice" : "progress update"}
              </label>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStatusModal(null)}
                  disabled={busy}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(statusModal.req.id, {
                    status: statusModal.status,
                    resolution_notes: modalNotes.trim(),
                    staff_notes: modalStaffNotes.trim(),
                    send_email: modalSendEmail,
                  })}
                  disabled={busy}
                  className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 ${isResolved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {busy ? "Saving..." : (modalSendEmail ? `${confirmLabel} & Email` : confirmLabel)}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
      {showCreate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4" onClick={() => !creating && setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">New Maintenance Request</h3>
              <button onClick={() => !creating && setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Property</label>
                  <select
                    value={newRequest.property_name}
                    onChange={(e) => setNewRequest({ ...newRequest, property_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select property</option>
                    <option value="College Place Apartments">College Place Apartments</option>
                    <option value="College Pointe Apartments">College Pointe Apartments</option>
                    <option value="College Center Apartments">College Center Apartments</option>
                    <option value="University Apartments">University Apartments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apartment <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newRequest.apartment}
                    onChange={(e) => setNewRequest({ ...newRequest, apartment: e.target.value })}
                    placeholder="e.g., 204"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tenant Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newRequest.full_name}
                    onChange={(e) => setNewRequest({ ...newRequest, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tenant Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={newRequest.email}
                    onChange={(e) => setNewRequest({ ...newRequest, email: e.target.value })}
                    placeholder="tenant@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newRequest.phone}
                    onChange={(e) => setNewRequest({ ...newRequest, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="pest control">Pest Control</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Urgency</label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={newRequest.preferred_date}
                    onChange={(e) => setNewRequest({ ...newRequest, preferred_date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select
                    value={newRequest.preferred_time}
                    onChange={(e) => setNewRequest({ ...newRequest, preferred_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Any time during business hours</option>
                    <option value="9 AM – 11 AM">9 AM – 11 AM</option>
                    <option value="11 AM – 1 PM">11 AM – 1 PM</option>
                    <option value="1 PM – 3 PM">1 PM – 3 PM</option>
                    <option value="3 PM – 5 PM">3 PM – 5 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Entry Notes</label>
                <textarea
                  value={newRequest.entry_notes}
                  onChange={(e) => setNewRequest({ ...newRequest, entry_notes: e.target.value })}
                  rows={2}
                  placeholder="e.g., Pet indoors, ring doorbell..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              {createError && <p className="text-red-600 text-sm">{createError}</p>}
              <p className="text-xs text-gray-500">The tenant will receive a confirmation email.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => !creating && setShowCreate(false)}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create & Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
      <SonarToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
