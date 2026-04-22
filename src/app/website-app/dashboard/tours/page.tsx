"use client";

import { useEffect, useState, useMemo } from "react";
import SonarToast, { useSonarToast } from "@/components/ui/SonarToast";

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
  title?: string | null;
  location?: string | null;
  is_virtual?: boolean;
  meet_link?: string | null;
  extra_guests?: string[] | null;
}

const STATUS_OPTIONS = ["confirmed", "completed", "cancelled", "no_show"];
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
  no_show: "bg-red-50 text-red-700 border-red-200",
};
const STATUS_DOT_COLORS: Record<string, string> = {
  confirmed: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-gray-400",
  no_show: "bg-red-500",
};
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ToursPage() {
  const { toast, setToast, showToast } = useSonarToast();
  const [tours, setTours] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TourBooking | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TourBooking | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Book-appointment modal state
  const [showBook, setShowBook] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");
  const initialBook = {
    title: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    property_slug: "",
    floor_plan: "",
    tour_date: "",
    tour_time: "",
    notes: "",
    location: "",
    is_virtual: false,
    extra_guests_raw: "office@collegeplace.us",
    meet_link: "",
  };
  const [defaultMeetLink, setDefaultMeetLink] = useState("");

  useEffect(() => {
    fetch("/api/tour-bookings/settings")
      .then((r) => (r.ok ? r.json() : { meet_link: "" }))
      .then((d) => setDefaultMeetLink(d.meet_link || ""))
      .catch(() => {});
  }, []);
  const [newBooking, setNewBooking] = useState(initialBook);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!newBooking.tour_date) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetch(`/api/available-slots?date=${newBooking.tour_date}`)
      .then((r) => r.json())
      .then((d) => setAvailableSlots(d.availableSlots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [newBooking.tour_date]);

  const handleBook = async () => {
    setBookError("");
    if (
      !newBooking.first_name.trim() ||
      !newBooking.last_name.trim() ||
      !newBooking.email.trim() ||
      !newBooking.phone.trim() ||
      !newBooking.tour_date ||
      !newBooking.tour_time
    ) {
      setBookError("Please fill in all required fields.");
      return;
    }
    setBooking(true);
    try {
      const extraGuests = newBooking.extra_guests_raw
        .split(/[,\s]+/)
        .map((e) => e.trim())
        .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      const res = await fetch("/api/tour-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBooking.title || null,
          first_name: newBooking.first_name,
          last_name: newBooking.last_name,
          email: newBooking.email,
          phone: newBooking.phone,
          property_slug: newBooking.property_slug || null,
          floor_plan: newBooking.floor_plan || null,
          tour_date: newBooking.tour_date,
          tour_time: newBooking.tour_time,
          notes: newBooking.notes || null,
          location: newBooking.location || null,
          is_virtual: newBooking.is_virtual,
          meet_link: newBooking.is_virtual ? (newBooking.meet_link || defaultMeetLink || null) : null,
          extra_guests: extraGuests,
          consent_communications: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to book appointment");
      }
      const created = await res.json();
      setTours((prev) => [...prev, created].sort((a, b) => a.tour_date.localeCompare(b.tour_date)));
      setShowBook(false);
      setNewBooking(initialBook);
      showToast("Appointment booked. Confirmation email sent.");
    } catch (err: unknown) {
      setBookError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBooking(false);
    }
  };

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
        showToast(`Tour status updated to ${status === "no_show" ? "No Show" : status}`);
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

  // ── Calendar helpers ──
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calendarMonth]);

  const toursByDate = useMemo(() => {
    const map: Record<string, TourBooking[]> = {};
    for (const t of filtered) {
      if (!map[t.tour_date]) map[t.tour_date] = [];
      map[t.tour_date].push(t);
    }
    return map;
  }, [filtered]);

  const calMonthLabel = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now.toISOString().split("T")[0]);
  };

  const dateKey = (day: number) => {
    const y = calendarMonth.getFullYear();
    const m = String(calendarMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedDayTours = selectedDate ? (toursByDate[selectedDate] || []).sort((a, b) => a.tour_time.localeCompare(b.tour_time)) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} booking{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="flex items-center gap-3">
        <button
          onClick={() => setShowBook(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Book Appointment
        </button>
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Calendar
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            List
          </button>
        </div>
        </div>
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

      {/* ── Calendar View ── */}
      {viewMode === "calendar" && (
        <div className="space-y-4">
          {/* Calendar header */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{calMonthLabel}</h2>
                <button onClick={goToToday} className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">Today</button>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{wd}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/30" />;

                const dk = dateKey(day);
                const dayTours = toursByDate[dk] || [];
                const isToday = dk === today;
                const isSelected = dk === selectedDate;
                const hasTours = dayTours.length > 0;

                // Collect unique statuses for dots
                const statuses = [...new Set(dayTours.map((t) => t.status))];

                return (
                  <button
                    key={dk}
                    onClick={() => setSelectedDate(dk)}
                    className={`min-h-[80px] border-b border-r border-gray-50 p-2 text-left transition-all hover:bg-blue-50/50 relative group ${isSelected ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""}`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                      isToday && isSelected ? "bg-blue-600 text-white" :
                      isToday ? "ring-2 ring-blue-500 text-blue-600" :
                      isSelected ? "bg-blue-100 text-blue-700" :
                      "text-gray-700"
                    }`}>
                      {day}
                    </span>
                    {hasTours && (
                      <div className="mt-1">
                        <span className="text-xs font-semibold text-gray-500">{dayTours.length} tour{dayTours.length !== 1 ? "s" : ""}</span>
                        <div className="flex gap-0.5 mt-0.5">
                          {statuses.slice(0, 4).map((s) => (
                            <span key={s} className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[s] || "bg-gray-400"}`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day's tours */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-blue-50">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-gray-900">{formatDate(selectedDate)}</span>
              {selectedDate === today && <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Today</span>}
              <span className="text-xs text-gray-600 ml-auto">{selectedDayTours.length} tour{selectedDayTours.length !== 1 ? "s" : ""}</span>
            </div>
            {selectedDayTours.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 text-sm">No tours scheduled for this day.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {selectedDayTours.map((tour) => (
                  <div key={tour.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-16 text-center">
                      <p className="text-sm font-bold text-gray-900">{formatTime(tour.tour_time)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => setSelected(tour)} className="text-left hover:text-blue-600 transition-colors">
                        <p className="font-medium text-gray-900">{tour.first_name} {tour.last_name}</p>
                        <p className="text-xs text-gray-600">{tour.email} {tour.phone ? `| ${tour.phone}` : ""}</p>
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
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── List View (Grouped by date) ── */}
      {viewMode === "list" && (sortedDates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-600 text-sm">No tour bookings found.</p>
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
                  <span className="text-xs text-gray-600 ml-auto">{groupedByDate[date].length} tour{groupedByDate[date].length !== 1 ? "s" : ""}</span>
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
                            <p className="text-xs text-gray-600">{tour.email} {tour.phone ? `| ${tour.phone}` : ""}</p>
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
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
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
      ))}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.first_name} {selected.last_name}</h3>
                <p className="text-sm text-gray-600">{selected.email}</p>
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
                  <p className="text-xs text-gray-600 mb-0.5">Tour Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selected.tour_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Tour Time</p>
                  <p className="text-sm font-medium text-gray-900">{formatTime(selected.tour_time)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{selected.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selected.status]}`}>
                    {selected.status === "no_show" ? "No Show" : selected.status}
                  </span>
                </div>
                {selected.floor_plan && (
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Floor Plan</p>
                    <p className="text-sm font-medium text-gray-900">{selected.floor_plan}</p>
                  </div>
                )}
                {selected.google_event_id && (
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Google Calendar</p>
                    <p className="text-sm font-medium text-emerald-600">Synced</p>
                  </div>
                )}
                {selected.is_virtual && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-0.5">Virtual Tour</p>
                    {selected.meet_link ? (
                      <a href={selected.meet_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Join Google Meet
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">Meet link pending (Calendar API not configured)</p>
                    )}
                  </div>
                )}
                {selected.extra_guests && selected.extra_guests.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-0.5">Additional guests</p>
                    <p className="text-sm text-gray-800">{selected.extra_guests.join(", ")}</p>
                  </div>
                )}
              </div>
              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Notes</p>
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
      {showBook && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4" onClick={() => !booking && setShowBook(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="w-6" />
              <button onClick={() => !booking && setShowBook(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div className="px-5 pt-4">
              <input
                type="text"
                value={newBooking.title}
                onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                placeholder="Add title"
                className="w-full text-2xl font-medium text-gray-900 placeholder-gray-400 border-0 border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 pb-1.5 bg-transparent"
              />
            </div>

            {/* Date + Time row */}
            <div className="px-5 py-4 flex items-start gap-4">
              <div className="w-6 pt-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newBooking.tour_date}
                  onChange={(e) => setNewBooking({ ...newBooking, tour_date: e.target.value, tour_time: "" })}
                  min={new Date().toISOString().split("T")[0]}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <select
                  value={newBooking.tour_time}
                  onChange={(e) => setNewBooking({ ...newBooking, tour_time: e.target.value })}
                  disabled={!newBooking.tour_date || loadingSlots}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  <option value="">{!newBooking.tour_date ? "Pick date first" : loadingSlots ? "Loading…" : availableSlots.length === 0 ? "No slots available" : "Add time"}</option>
                  {availableSlots.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest (primary) */}
            <div className="px-5 py-3 flex items-start gap-4 border-t border-gray-50">
              <div className="w-6 pt-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="First name *" value={newBooking.first_name} onChange={(e) => setNewBooking({ ...newBooking, first_name: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input type="text" placeholder="Last name *" value={newBooking.last_name} onChange={(e) => setNewBooking({ ...newBooking, last_name: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="email" placeholder="Guest email *" value={newBooking.email} onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input type="tel" placeholder="Phone *" value={newBooking.phone} onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>

            {/* Extra guests (staff invites) */}
            <div className="px-5 py-3 flex items-start gap-4 border-t border-gray-50">
              <div className="w-6 pt-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newBooking.extra_guests_raw}
                  onChange={(e) => setNewBooking({ ...newBooking, extra_guests_raw: e.target.value })}
                  placeholder="Add staff guests (comma-separated emails)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[11px] text-gray-500 mt-1">office@collegeplace.us is included by default so staff receive the invite.</p>
              </div>
            </div>

            {/* Google Meet toggle */}
            <div className="px-5 py-3 flex items-center gap-4 border-t border-gray-50">
              <div className="w-6 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Add Google Meet video conferencing</p>
                <p className="text-[11px] text-gray-500">A secure one-time link will be emailed to the guest.</p>
              </div>
              <button
                type="button"
                onClick={() => setNewBooking({ ...newBooking, is_virtual: !newBooking.is_virtual })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newBooking.is_virtual ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newBooking.is_virtual ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {newBooking.is_virtual && (
              <div className="px-5 py-3 flex items-start gap-4 border-t border-gray-50 bg-blue-50/30">
                <div className="w-6 pt-2 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Google Meet link</label>
                  <input
                    type="url"
                    value={newBooking.meet_link}
                    onChange={(e) => setNewBooking({ ...newBooking, meet_link: e.target.value })}
                    placeholder={defaultMeetLink || "https://meet.google.com/xxx-yyyy-zzz"}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    {defaultMeetLink
                      ? `Leave blank to use the office default (${defaultMeetLink}).`
                      : "No default set. Enter the persistent office Meet link (or configure OFFICE_MEET_LINK env var)."}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="px-5 py-3 flex items-start gap-4 border-t border-gray-50">
              <div className="w-6 pt-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={newBooking.location}
                onChange={(e) => setNewBooking({ ...newBooking, location: e.target.value })}
                placeholder={newBooking.is_virtual ? "Location (optional — virtual)" : "Add location"}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Property + floor plan */}
            <div className="px-5 py-3 flex items-start gap-4 border-t border-gray-50">
              <div className="w-6 pt-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <select value={newBooking.property_slug} onChange={(e) => setNewBooking({ ...newBooking, property_slug: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Select property</option>
                  <option value="college-place-apartments">College Place Apartments</option>
                  <option value="college-pointe-apartments">College Pointe Apartments</option>
                  <option value="college-center-apartments">College Center Apartments</option>
                  <option value="university-apartments">University Apartments</option>
                </select>
                <input type="text" value={newBooking.floor_plan} onChange={(e) => setNewBooking({ ...newBooking, floor_plan: e.target.value })} placeholder="Floor plan (optional)" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            {/* Notes */}
            <div className="px-5 py-3 flex items-start gap-4 border-t border-gray-50">
              <div className="w-6 pt-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75h13.5m-13.5 5h9m-9 5h6m4.5-5l3 3m0 0l3-3m-3 3V6.75" />
                </svg>
              </div>
              <textarea value={newBooking.notes} onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })} rows={2} placeholder="Add description" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
            </div>

            {bookError && <p className="px-5 pt-2 text-red-600 text-sm">{bookError}</p>}

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => !booking && setShowBook(false)} disabled={booking} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Cancel</button>
              <button onClick={handleBook} disabled={booking} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {booking ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      <SonarToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
