"use client";

import { useEffect, useState } from "react";
import SonarToast, { useSonarToast } from "@/components/ui/SonarToast";

interface MaintenanceRequest {
  id: string;
  apartment: string;
  full_name: string;
  email: string;
  phone: string | null;
  category: string | null;
  urgency: string;
  description: string;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-50 text-gray-500 border-gray-200",
};
const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

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
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MaintenanceRequest | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
        if (selected?.id === id) setSelected({ ...selected, ...updated });
        if (status === "resolved" || status === "closed") {
          showToast(`Completion notice sent to tenant`);
        } else {
          showToast(`Status updated to ${status}`);
        }
      }
    } finally {
      setUpdating(null);
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

  const filtered = requests.filter((r) => {
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

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} request{filtered.length !== 1 ? "s" : ""} found</p>
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
                      updateStatus(req.id, e.target.value);
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
                  <p className="text-xs text-gray-600 mb-0.5">Category</p>
                  <p className="text-sm font-medium text-gray-900">{selected.category || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{selected.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Submitted</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selected.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Description</p>
                <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">{selected.description}</div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
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
      <SonarToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
