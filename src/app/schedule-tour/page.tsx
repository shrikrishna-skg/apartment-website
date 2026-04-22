"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PROPERTIES, SITE } from "@/data/site-data";

/* ── booking window: today through +60 days ── */
const MAX_BOOKING_DAYS = 60;

/* ── format ISO yyyy-mm-dd date for display ── */
function formatIsoDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" }) {
  if (!iso) return "";
  // parse as local midnight to avoid timezone shift
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", opts);
}

/* ── convert Date to yyyy-mm-dd (local) ── */
function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ── build calendar grid for a given month (year, zero-indexed month) ── */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  // pad trailing so we always have full weeks (multiple of 7)
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ── icons ── */
const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);
const IconMap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ── main page wrapper with Suspense ── */
export default function ScheduleTourWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#6b7280" }}>Loading...</span></div>}>
      <ScheduleTourPage />
    </Suspense>
  );
}

function ScheduleTourPage() {
  const searchParams = useSearchParams();
  const propertyParam = searchParams.get("property") || "";
  const floorPlanParam = searchParams.get("floor_plan") || "";

  const [mode, setMode] = useState<"contact" | "schedule">("contact");
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* contact form state */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(propertyParam);
  const [consent, setConsent] = useState(false);

  /* schedule form state */
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* calendar view state */
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const maxBookingDate = (() => { const d = new Date(today); d.setDate(d.getDate() + MAX_BOOKING_DAYS); return d; })();

  const calendarCells = buildMonthGrid(viewMonth.year, viewMonth.month);
  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const canGoPrevMonth = (() => {
    const prev = new Date(viewMonth.year, viewMonth.month - 1, 1);
    // allow going back only if prev month still contains today or future
    const lastOfPrev = new Date(viewMonth.year, viewMonth.month, 0);
    return lastOfPrev >= today;
  })();
  const canGoNextMonth = (() => {
    const firstOfNext = new Date(viewMonth.year, viewMonth.month + 1, 1);
    return firstOfNext <= maxBookingDate;
  })();

  const isDateSelectable = (d: Date) => d >= today && d <= maxBookingDate && d.getDay() !== 0;

  /* fetch available slots when date changes */
  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/available-slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.availableSlots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch {
      setAvailableSlots([]);
    }
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
      setSelectedTime("");
    }
  }, [selectedDate, fetchSlots]);

  const inputError = (value: string) =>
    attempted && !value.trim()
      ? "border-red-500/70 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
      : "";

  const handleContactContinue = () => {
    setAttempted(true);
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !consent) return;
    setAttempted(false);
    setMode("schedule");
  };

  const handleScheduleSubmit = async () => {
    setAttempted(true);
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/tour-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          property_slug: selectedProperty || null,
          floor_plan: floorPlanParam || null,
          tour_date: selectedDate,
          tour_time: selectedTime,
          consent_communications: consent,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to book tour");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  /* split available slots by AM / PM */
  const morningSlots = availableSlots.filter((s) => s.endsWith("AM"));
  const afternoonSlots = availableSlots.filter((s) => s.endsWith("PM"));

  /* ── success state ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-ambient" />
        <div className="glass p-12 text-center max-w-lg">
          <div className="text-emerald-600 flex justify-center mb-4">
            <IconCheck />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-3">Tour Scheduled!</h1>
          <p className="text-gray-600 mb-2">
            Your appointment has been confirmed for{" "}
            <span className="text-gray-900 font-medium">
              {formatIsoDate(selectedDate)}
            </span>{" "}
            at{" "}
            <span className="text-gray-900 font-medium">{selectedTime}</span>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation to <span className="text-blue-600">{email}</span>.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setMode("contact");
              setFirstName("");
              setLastName("");
              setEmail("");
              setPhone("");
              setSelectedProperty("");
              setSelectedDate("");
              setSelectedTime("");
              setAttempted(false);
            }}
            className="btn-outline text-sm"
          >
            Schedule Another Tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-ambient" />

      {/* ── header ── */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6 sm:pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-3">
          Apartment Tour &amp; Leasing Visit
        </h1>
        <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
          <span className="text-blue-600">
            <IconClock />
          </span>
          10 min appointments · Real-time availability
        </p>
      </header>

      {/* ── main layout ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── left: form ── */}
          <div className="lg:col-span-2">
            {/* tab toggle */}
            <div className="flex mb-8 glass-subtle p-1 rounded-xl max-w-xs">
              <button
                onClick={() => {
                  setMode("contact");
                  setAttempted(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "contact"
                    ? "bg-[#1a73e8] text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <IconUser />
                Contact
              </button>
              <button
                onClick={() => {
                  if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
                    setAttempted(true);
                    return;
                  }
                  setMode("schedule");
                  setAttempted(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "schedule"
                    ? "bg-[#1a73e8] text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <IconCalendar />
                Schedule
              </button>
            </div>

            {/* ── contact form ── */}
            {mode === "contact" && (
              <div className="glass p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Your Information</h2>
                  <p className="text-sm text-gray-500">Fill in your details to get started.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* first name */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`input-glass ${inputError(firstName)}`}
                    />
                    {attempted && !firstName.trim() && (
                      <p className="text-red-600 text-xs mt-1">First name is required</p>
                    )}
                  </div>

                  {/* last name */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Last Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Smith"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`input-glass ${inputError(lastName)}`}
                    />
                    {attempted && !lastName.trim() && (
                      <p className="text-red-600 text-xs mt-1">Last name is required</p>
                    )}
                  </div>
                </div>

                {/* email */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input-glass ${inputError(email)}`}
                  />
                  {attempted && !email.trim() && (
                    <p className="text-red-600 text-xs mt-1">Email is required</p>
                  )}
                </div>

                {/* phone */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Phone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`input-glass ${inputError(phone)}`}
                  />
                  {attempted && !phone.trim() && (
                    <p className="text-red-600 text-xs mt-1">Phone number is required</p>
                  )}
                </div>

                {/* property dropdown */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Property <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="input-glass appearance-none cursor-pointer"
                  >
                    <option value="">Select a property</option>
                    {PROPERTIES.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Consent & Communications */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      By submitting this form, I consent to receive communications from College Place Apartments including emails, phone calls, and text messages at the number provided. I understand that message & data rates may apply, message frequency varies, and I can opt out at any time by replying STOP. Consent is not a condition of purchase or tenancy. View our{" "}
                      <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
                      {" "}and{" "}
                      <a href="/terms" className="text-blue-600 underline hover:text-blue-800">Terms & Conditions</a>.
                    </span>
                  </label>
                  {attempted && !consent && (
                    <p className="text-red-600 text-xs">You must consent to communications</p>
                  )}
                </div>

                {/* continue button */}
                <button onClick={handleContactContinue} className="btn-glow w-full !py-3.5 text-base">
                  Continue
                </button>
              </div>
            )}

            {/* ── schedule form ── */}
            {mode === "schedule" && (
              <div className="glass p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Pick a Date &amp; Time</h2>
                  <p className="text-sm text-gray-500">
                    Scheduling for{" "}
                    <span className="text-blue-600 font-medium">
                      {firstName} {lastName}
                    </span>
                  </p>
                </div>

                {/* Calendar + time slots stacked vertically */}
                <div className="space-y-6">
                  {/* ── Calendar ── */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-3">Select a Date</label>
                    <div className="glass-subtle rounded-xl p-4 sm:p-5 max-w-md mx-auto">
                      {/* Month header with nav arrows */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => canGoPrevMonth && setViewMonth(v => {
                            const d = new Date(v.year, v.month - 1, 1);
                            return { year: d.getFullYear(), month: d.getMonth() };
                          })}
                          disabled={!canGoPrevMonth}
                          aria-label="Previous month"
                          className={`p-1.5 rounded-lg transition-colors ${canGoPrevMonth ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 cursor-not-allowed"}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                        </button>
                        <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
                        <button
                          type="button"
                          onClick={() => canGoNextMonth && setViewMonth(v => {
                            const d = new Date(v.year, v.month + 1, 1);
                            return { year: d.getFullYear(), month: d.getMonth() };
                          })}
                          disabled={!canGoNextMonth}
                          aria-label="Next month"
                          className={`p-1.5 rounded-lg transition-colors ${canGoNextMonth ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 cursor-not-allowed"}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                      </div>

                      {/* Weekday header */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1">{d}</div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarCells.map((cell, i) => {
                          if (!cell) return <div key={`blank-${i}`} />;
                          const iso = toIsoDate(cell);
                          const selectable = isDateSelectable(cell);
                          const isToday = cell.getTime() === today.getTime();
                          const isSelected = iso === selectedDate;
                          return (
                            <button
                              key={iso}
                              type="button"
                              disabled={!selectable}
                              onClick={() => selectable && setSelectedDate(iso)}
                              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                                isSelected
                                  ? "bg-[#1a73e8] text-white font-semibold shadow-md shadow-blue-100"
                                  : !selectable
                                  ? "text-gray-300 cursor-not-allowed"
                                  : isToday
                                  ? "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                              aria-label={formatIsoDate(iso)}
                              aria-pressed={isSelected}
                            >
                              {cell.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Hint */}
                      <p className="text-[11px] text-gray-400 text-center mt-3">Tours run Mon–Sat. Sundays unavailable.</p>
                    </div>
                    {attempted && !selectedDate && (
                      <p className="text-red-600 text-xs mt-2 text-center">Please select a date</p>
                    )}
                  </div>

                  {/* ── Time slots ── */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-3">
                      {selectedDate ? `Available times — ${formatIsoDate(selectedDate, { weekday: "long", month: "short", day: "numeric" })}` : "Select a Time"}
                    </label>
                    <div className="glass-subtle rounded-xl p-4 sm:p-5">
                      {!selectedDate ? (
                        <div className="flex items-center justify-center py-8 text-center">
                          <p className="text-gray-500 text-sm">Pick a date on the calendar to see available times.</p>
                        </div>
                      ) : loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Checking availability…
                          </div>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="text-amber-600 text-sm font-medium mb-1">No slots available on this date.</p>
                          <p className="text-gray-500 text-xs">Please pick a different day or call us directly.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {morningSlots.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Morning</p>
                              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {morningSlots.map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedTime(slot)}
                                    className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                                      selectedTime === slot
                                        ? "bg-[#1a73e8] text-white shadow-md shadow-blue-100"
                                        : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {afternoonSlots.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Afternoon</p>
                              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {afternoonSlots.map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedTime(slot)}
                                    className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                                      selectedTime === slot
                                        ? "bg-[#1a73e8] text-white shadow-md shadow-blue-100"
                                        : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {attempted && !selectedTime && selectedDate && (
                      <p className="text-red-600 text-xs mt-2">Please select a time</p>
                    )}
                  </div>
                </div>

                {/* selected summary */}
                {selectedDate && selectedTime && (
                  <div className="glass-subtle p-4 flex items-center gap-3 text-sm">
                    <span className="text-blue-600">
                      <IconCalendar />
                    </span>
                    <span className="text-gray-700">
                      Your appointment:{" "}
                      <span className="text-gray-900 font-semibold">
                        {formatIsoDate(selectedDate)}
                      </span>{" "}
                      at <span className="text-gray-900 font-semibold">{selectedTime}</span>
                      <span className="text-gray-400 ml-1">(10 min)</span>
                    </span>
                  </div>
                )}

                {/* error message */}
                {submitError && (
                  <div className="glass-subtle p-3 text-red-600 text-sm border border-red-200 rounded-xl">
                    {submitError}
                  </div>
                )}

                {/* actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setMode("contact");
                      setAttempted(false);
                    }}
                    className="btn-outline flex-1 !py-3.5"
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleScheduleSubmit}
                    className="btn-glow flex-1 !py-3.5 text-base"
                    disabled={submitting}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── right sidebar ── */}
          <aside className="space-y-6">
            {/* leasing office info */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5">Leasing Office</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-600 mt-0.5">
                    <IconMap />
                  </span>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 mb-0.5">{SITE.name}</p>
                    <p>{SITE.address.street}</p>
                    <p>
                      {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-600 mt-0.5">
                    <IconClock />
                  </span>
                  <div className="text-sm">
                    <p>{SITE.hours.weekday}</p>
                    <p>{SITE.hours.weekend}</p>
                  </div>
                </div>
                <a
                  href={`tel:${SITE.phone}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="text-blue-600">
                    <IconPhone />
                  </span>
                  <span className="text-sm">{SITE.phone}</span>
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="text-blue-600">
                    <IconMail />
                  </span>
                  <span className="text-sm">{SITE.email}</span>
                </a>
              </div>
            </div>

            {/* what to expect */}
            <div className="glass p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What to Expect</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Tour the apartment and common areas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Review available floor plans and pricing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Discuss lease terms and move-in dates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Ask questions about the community
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Apply on the spot if you find your match
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
