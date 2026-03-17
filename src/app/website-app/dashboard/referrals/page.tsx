"use client";

import { useEffect, useState } from "react";

interface Referral {
  id: string;
  referrer_name: string;
  referrer_email: string;
  referrer_phone: string;
  referrer_unit: string;
  preferred_contact: string;
  relationship: string;
  friend_name: string;
  friend_email: string | null;
  friend_phone: string | null;
  move_in_timeline: string | null;
  budget_range: string | null;
  occupants: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["submitted", "contacted", "toured", "leased", "expired", "rejected"];
const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  toured: "bg-purple-50 text-purple-700 border-purple-200",
  leased: "bg-green-50 text-green-700 border-green-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Referral | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Referral | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await fetch("/api/referrals");
      const data = await res.json();
      setReferrals(Array.isArray(data) ? data : []);
    } catch {
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReferrals((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
        if (selected?.id === id) setSelected({ ...selected, ...updated });
      }
    } finally {
      setUpdating(null);
    }
  };

  const softDelete = async (ref: Referral) => {
    setDeleting(ref.id);
    try {
      const res = await fetch(`/api/referrals/${ref.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      });
      if (res.ok) {
        setReferrals((prev) => prev.filter((r) => r.id !== ref.id));
        setSelected(null);
        setConfirmDelete(null);
      }
    } finally {
      setDeleting(null);
    }
  };

  const filtered = referrals.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.referrer_name?.toLowerCase().includes(q) ||
        r.friend_name?.toLowerCase().includes(q) ||
        r.referrer_email?.toLowerCase().includes(q) ||
        r.referrer_unit?.toLowerCase().includes(q)
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
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} referral{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by referrer, friend, or unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STATUS_OPTIONS.map((s) => {
          const count = referrals.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`text-center p-3 rounded-xl border transition-all ${
                statusFilter === s ? STATUS_COLORS[s] : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-[10px] text-gray-500">{s.charAt(0).toUpperCase() + s.slice(1)}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">No referrals found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Referrer</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Unit</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Friend</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Timeline</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(ref)} className="text-left hover:text-blue-600 transition-colors">
                        <p className="font-medium text-gray-900">{ref.referrer_name}</p>
                        <p className="text-xs text-gray-400">{ref.referrer_email}</p>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{ref.referrer_unit}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-900">{ref.friend_name}</p>
                      <p className="text-xs text-gray-400">{ref.friend_email || ref.friend_phone || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{ref.move_in_timeline || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[ref.status]}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(ref.created_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                      <select
                        value={ref.status}
                        onChange={(e) => updateStatus(ref.id, e.target.value)}
                        disabled={updating === ref.id}
                        className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(ref); }}
                        title="Delete"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Referral Details</h3>
                <p className="text-sm text-gray-400">Submitted {formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Referrer */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Referrer</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-400">Name</p><p className="text-sm font-medium text-gray-900">{selected.referrer_name}</p></div>
                  <div><p className="text-xs text-gray-400">Unit</p><p className="text-sm font-medium text-gray-900">{selected.referrer_unit}</p></div>
                  <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-900">{selected.referrer_email}</p></div>
                  <div><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900">{selected.referrer_phone}</p></div>
                  <div><p className="text-xs text-gray-400">Preferred Contact</p><p className="text-sm font-medium text-gray-900">{selected.preferred_contact}</p></div>
                  <div><p className="text-xs text-gray-400">Relationship</p><p className="text-sm font-medium text-gray-900">{selected.relationship}</p></div>
                </div>
              </div>

              {/* Friend */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Referred Friend</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-400">Name</p><p className="text-sm font-medium text-gray-900">{selected.friend_name}</p></div>
                  <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-900">{selected.friend_email || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900">{selected.friend_phone || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Move-in Timeline</p><p className="text-sm font-medium text-gray-900">{selected.move_in_timeline || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Budget</p><p className="text-sm font-medium text-gray-900">{selected.budget_range || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Occupants</p><p className="text-sm font-medium text-gray-900">{selected.occupants || "—"}</p></div>
                </div>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{selected.notes}</div>
                </div>
              )}

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
                      {s.charAt(0).toUpperCase() + s.slice(1)}
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
              <p className="text-sm text-gray-500 mb-6">Referral from <strong>{confirmDelete.referrer_name}</strong> will be moved to the Recycle Bin.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => softDelete(confirmDelete)} disabled={deleting === confirmDelete.id} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">{deleting ? "Deleting..." : "Move to Recycle Bin"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
