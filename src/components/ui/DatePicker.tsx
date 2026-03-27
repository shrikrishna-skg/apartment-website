"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  eachDayOfInterval,
  getYear,
  getMonth,
  setMonth,
  setYear,
} from "date-fns";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  id?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  value,
  onChange,
  label,
  required,
  placeholder = "Select a date",
  minDate,
  maxDate,
  className = "",
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parsed = new Date(value + "T00:00:00");
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowYearPicker(false);
        setShowMonthPicker(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Position calendar above if near bottom of viewport
  const [dropUp, setDropUp] = useState(false);
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 380);
    }
  }, [isOpen]);

  const handleSelectDate = useCallback(
    (day: Date) => {
      onChange(format(day, "yyyy-MM-dd"));
      setIsOpen(false);
      setShowYearPicker(false);
      setShowMonthPicker(false);
    },
    [onChange]
  );

  const isDisabled = useCallback(
    (day: Date) => {
      if (minDate && isBefore(day, minDate)) return true;
      if (maxDate && isAfter(day, maxDate)) return true;
      return false;
    },
    [minDate, maxDate]
  );

  // Generate calendar days
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Year range for year picker
  const currentYear = getYear(viewDate);
  const startYear = currentYear - 6;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const displayValue = selectedDate && !isNaN(selectedDate.getTime())
    ? format(selectedDate, "MM/dd/yyyy")
    : "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input field */}
      <div
        className="relative cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && selectedDate) {
            setViewDate(selectedDate);
          }
        }}
      >
        <input
          id={id}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          style={{ caretColor: "transparent" }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Calendar dropdown */}
      {isOpen && (
        <div
          ref={calendarRef}
          className={`absolute z-50 mt-2 w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 ${
            dropUp ? "bottom-full mb-2" : "top-full"
          }`}
          style={{ left: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
            <button
              type="button"
              onClick={() => {
                if (showYearPicker) {
                  // Go back 12 years
                  setViewDate(subYears(viewDate, 12));
                } else {
                  setViewDate(subMonths(viewDate, 1));
                }
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }}
                className="px-2 py-1 rounded-lg hover:bg-white/20 text-white font-semibold text-sm transition-colors"
              >
                {MONTHS[getMonth(viewDate)]}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }}
                className="px-2 py-1 rounded-lg hover:bg-white/20 text-white font-semibold text-sm transition-colors"
              >
                {getYear(viewDate)}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showYearPicker) {
                  setViewDate(addYears(viewDate, 12));
                } else {
                  setViewDate(addMonths(viewDate, 1));
                }
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Year Picker */}
          {showYearPicker && (
            <div className="p-3 grid grid-cols-3 gap-2">
              {years.map((year) => (
                <button
                  type="button"
                  key={year}
                  onClick={() => {
                    setViewDate(setYear(viewDate, year));
                    setShowYearPicker(false);
                  }}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    year === getYear(viewDate)
                      ? "bg-blue-600 text-white shadow-md"
                      : year === new Date().getFullYear()
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Month Picker */}
          {showMonthPicker && !showYearPicker && (
            <div className="p-3 grid grid-cols-3 gap-2">
              {MONTHS.map((month, idx) => (
                <button
                  type="button"
                  key={month}
                  onClick={() => {
                    setViewDate(setMonth(viewDate, idx));
                    setShowMonthPicker(false);
                  }}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    idx === getMonth(viewDate)
                      ? "bg-blue-600 text-white shadow-md"
                      : idx === new Date().getMonth() && getYear(viewDate) === new Date().getFullYear()
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Day Grid */}
          {!showYearPicker && !showMonthPicker && (
            <div className="p-3">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((wd) => (
                  <div
                    key={wd}
                    className="text-center text-xs font-semibold text-gray-400 py-1.5"
                  >
                    {wd}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day) => {
                  const inMonth = isSameMonth(day, viewDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const disabled = isDisabled(day);

                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      disabled={disabled || !inMonth}
                      onClick={() => handleSelectDate(day)}
                      className={`
                        relative w-full aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                        ${!inMonth ? "text-gray-200 cursor-default" : ""}
                        ${inMonth && !isSelected && !disabled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer" : ""}
                        ${isSelected ? "bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700" : ""}
                        ${isToday && !isSelected && inMonth ? "font-bold text-blue-600" : ""}
                        ${disabled && inMonth ? "text-gray-300 cursor-not-allowed" : ""}
                      `}
                    >
                      {format(day, "d")}
                      {isToday && !isSelected && inMonth && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={() => {
                setViewDate(new Date());
                setShowYearPicker(false);
                setShowMonthPicker(false);
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Today
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
