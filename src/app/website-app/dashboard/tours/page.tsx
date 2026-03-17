"use client";

import { useEffect, useState } from "react";

interface TourBooking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tour_date: string;
  tour_time: string;
  property_slug: string | null;
  floor_plan: string | null;
  notes: string | null;
  status: string;
  google_event_id: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ["confirmed", "completed", "cancelled", "no_show"];
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
  no_show: "bg-red-50 text-red-700 border-red-200",
};

export default function ToursPage() {
  const [tours, setTours] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TourBooking | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TourBooking | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await fetch("/api/tour-bookings");
      const data = await res.json();
      setTours(Array.isArray(data) ? data : []);
    } catch {
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/tour-bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTours((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
        if (selected?.id === id) setSelected({ ...selected, ...updated });
      }
    } finally {
      setUpdating(null);
    }
  };

  const softDelete = async (tour: TourBooking) => {
    setDeleting(tour.id);
    try {
      const res = await fetch(`/api/tour-bookings/${tour.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      });
      if (res.ok) {
        setTours((prev) => prev.filter((t) => t.id !== tour.id));
        setSelected(null);
        setConfirmDelete(null);
      }
    } finally {
      setDeleting(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const filtered = tours.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (dateFilter === "upcoming" && t.tour_date < today) return false;
    if (dateFilter === "past" && t.tour_date >= today) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${t.first_name} ${t.last_name}`.toLowerCase();
      return name.includes(q) || t.email?.toLowerCase().includes(q) || t.phone?.includes(q);
    }
    return true;
  });

  const formatDate = (d: string) => {
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  const formatTime = (t: string) => {
    try {
      const [h, m] = t.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    } catch {
      return t;
    }
  };

  // Group by date for calendar-like view
  const groupedByDate = filtered.reduce<Record<string, TourBooking[]>>((acc, t) => {
    if (!acc[t.tour_date]) acc[t.tour_date] = [];
    acc[t.tour_date].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

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
        <h1 className="text-2xl font-bold text-gray-900">Tour Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} booking{filtered.length !== 1 ? "s" : ""} found</p>
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
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as "all" | "upcoming" | "past")}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Dates</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "no_show" ? "No Show" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">No tour bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const isPast = date < today;
            const isToday = date === today;
            return (
              <div key={date} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className={`px-5 py-3 border-b border-gray-100 flex items-center gap-3 ${isToday ? "bg-blue-50" : isPast ? "bg-gray-50" : ""}`}>
                  <div className={`w-2 h-2 rounded-full ${isToday ? "bg-blue-500" : isPast ? "bg-gray-300" : "bg-emerald-500"}`} />
                  <span className="text-sm font-semibold text-gray-900">{formatDate(date)}</span>
                  {isToday && <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Today</span>}
                  <span className="text-xs text-gray-400 ml-auto">{groupedByDate[date].length} tour{groupedByDate[date].length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {groupedByDate[date]
                    .sort((a, b) => a.tour_time.localeCompare(b.tour_time))
                    .map((tour) => (
                      <div key={tour.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="w-16 text-center">
                          <p className="text-sm font-bold text-gray-900">{formatTime(tour.tour_time)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <button onClick={() => setSelected(tour)} className="text-left hover:text-blue-600 transition-colors">
                            <p className="font-medium text-gray-900">{tour.first_name} {tour.last_name}</p>
                            <p className="text-xs text-gray-400">{tour.email} {tour.phone ? `| ${tour.phone}` : ""}</p>
                          </button>
                        </div>
                        {tour.floor_plan && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hidden sm:inline-flex">{tour.floor_plan}</span>
                        )}
                        {tour.google_event_id && (
                          <span className="text-xs text-emerald-600" title="Synced to Google Calendar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        )}
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[tour.status] || "bg-gray-50 text-gray-500"}`}>
                          {tour.status === "no_show" ? "No Show" : tour.status}
                        </span>
                        <select
                          value={tour.status}
                          onChange={(e) => updateStatus(tour.id, e.target.value)}
                          disabled={updating === tour.id}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s === "no_show" ? "No Show" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(tour); }}
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.first_name} {selected.last_name}</h3>
                <p className="text-sm text-gray-400">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tour Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selected.tour_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tour Time</p>
                  <p className="text-sm font-medium text-gray-900">{formatTime(selected.tour_time)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{selected.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selected.status]}`}>
                    {selected.status === "no_show" ? "No Show" : selected.status}
                  </span>
                </div>
                {selected.floor_plan && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Floor Plan</p>
                    <p className="text-sm font-medium text-gray-900">{selected.floor_plan}</p>
                  </div>
                )}
                {selected.google_event_id && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Google Calendar</p>
                    <p className="text-sm font-medium text-emerald-600">Synced</p>
                  </div>
                )}
              </div>
              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selected.notes}</p>
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
                      {s === "no_show" ? "No Show" : s.charAt(0).toUpperCase() + s.slice(1)}
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
      {/* Confirm Delete Modal */}
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
              <p className="text-sm text-gray-500 mb-6">
                <strong>{confirmDelete.first_name} {confirmDelete.last_name}</strong>&apos;s tour booking will be moved to the Recycle Bin.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => softDelete(confirmDelete)} disabled={deleting === confirmDelete.id} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                  {deleting ? "Deleting..." : "Move to Recycle Bin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
