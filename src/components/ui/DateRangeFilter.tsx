"use client";

import { useMemo, useState } from "react";

export type DateRangePreset =
  | "all"
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "3_months"
  | "6_months"
  | "this_year"
  | "custom";

export interface DateRange {
  preset: DateRangePreset;
  from: string | null; // yyyy-mm-dd, inclusive
  to: string | null;   // yyyy-mm-dd, inclusive
}

export const defaultDateRange: DateRange = { preset: "all", from: null, to: null };

/** Filter a list by a date field (string/ISO) against a DateRange. */
export function filterByDateRange<T>(
  rows: T[],
  getDate: (row: T) => string | null | undefined,
  range: DateRange
): T[] {
  if (range.preset === "all") return rows;
  const bounds = computeBounds(range);
  if (!bounds) return rows;
  return rows.filter((r) => {
    const d = getDate(r);
    if (!d) return false;
    const t = new Date(d).getTime();
    return t >= bounds.start && t <= bounds.end;
  });
}

function computeBounds(range: DateRange): { start: number; end: number } | null {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };
  const endOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x.getTime();
  };

  switch (range.preset) {
    case "today": {
      return { start: startOfDay(now), end: endOfDay(now) };
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case "this_week": {
      const start = new Date(now);
      const dayOfWeek = start.getDay(); // 0 Sun
      start.setDate(start.getDate() - dayOfWeek);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case "3_months": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case "6_months": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 6);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case "custom": {
      if (!range.from || !range.to) return null;
      return { start: startOfDay(new Date(range.from)), end: endOfDay(new Date(range.to)) };
    }
    default:
      return null;
  }
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
  all: "All time",
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This week",
  this_month: "This month",
  "3_months": "Last 3 months",
  "6_months": "Last 6 months",
  this_year: "This year",
  custom: "Custom range",
};

export default function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  const [showCustom, setShowCustom] = useState(value.preset === "custom");

  const summary = useMemo(() => {
    if (value.preset !== "custom") return PRESET_LABELS[value.preset];
    if (value.from && value.to) return `${value.from} → ${value.to}`;
    return "Custom range";
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <select
        value={value.preset}
        onChange={(e) => {
          const preset = e.target.value as DateRangePreset;
          setShowCustom(preset === "custom");
          onChange({ preset, from: preset === "custom" ? value.from : null, to: preset === "custom" ? value.to : null });
        }}
        className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        title={summary}
      >
        {(Object.keys(PRESET_LABELS) as DateRangePreset[]).map((p) => (
          <option key={p} value={p}>{PRESET_LABELS[p]}</option>
        ))}
      </select>
      {showCustom && (
        <>
          <input
            type="date"
            value={value.from || ""}
            onChange={(e) => onChange({ ...value, preset: "custom", from: e.target.value || null })}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-gray-400 text-sm">→</span>
          <input
            type="date"
            value={value.to || ""}
            onChange={(e) => onChange({ ...value, preset: "custom", to: e.target.value || null })}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </>
      )}
    </div>
  );
}
