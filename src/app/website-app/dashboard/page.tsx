"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  applications: { total: number; pending: number; reviewing: number; approved: number; recent: number };
  tours: { total: number; confirmed: number; completed: number; cancelled: number; recent: number };
  inquiries: { total: number; new: number; replied: number; recent: number };
  maintenance: { total: number; open: number; in_progress: number; resolved: number; recent: number };
  referrals: { total: number; submitted: number; leased: number; recent: number };
  subscribers: { total: number; recent: number };
}

const CARDS = [
  {
    key: "applications" as const,
    label: "Applications",
    href: "/website-app/dashboard/applications",
    color: "blue",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    stat: (s: Stats) => s.applications.total,
    sub: (s: Stats) => `${s.applications.pending} pending, ${s.applications.reviewing} reviewing`,
  },
  {
    key: "tours" as const,
    label: "Tour Bookings",
    href: "/website-app/dashboard/tours",
    color: "emerald",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    stat: (s: Stats) => s.tours.total,
    sub: (s: Stats) => `${s.tours.confirmed} confirmed, ${s.tours.completed} completed`,
  },
  {
    key: "inquiries" as const,
    label: "Inquiries",
    href: "/website-app/dashboard/inquiries",
    color: "amber",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    stat: (s: Stats) => s.inquiries.total,
    sub: (s: Stats) => `${s.inquiries.new} new, ${s.inquiries.replied} replied`,
  },
  {
    key: "maintenance" as const,
    label: "Maintenance",
    href: "/website-app/dashboard/maintenance",
    color: "red",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.664 5.664a2.12 2.12 0 01-3-3l5.664-5.664m0 0L21 3m-13.5 9.75V21M3 12.75h7.25" />
      </svg>
    ),
    stat: (s: Stats) => s.maintenance.total,
    sub: (s: Stats) => `${s.maintenance.open} open, ${s.maintenance.in_progress} in progress`,
  },
  {
    key: "referrals" as const,
    label: "Referrals",
    href: "/website-app/dashboard/referrals",
    color: "violet",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    stat: (s: Stats) => s.referrals.total,
    sub: (s: Stats) => `${s.referrals.submitted} submitted, ${s.referrals.leased} leased`,
  },
  {
    key: "subscribers" as const,
    label: "Subscribers",
    href: "/website-app/dashboard/subscribers",
    color: "pink",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    stat: (s: Stats) => s.subscribers.total,
    sub: (s: Stats) => `${s.subscribers.recent} this week`,
  },
];

const COLOR_MAP: Record<string, { bg: string; iconBg: string; iconText: string; badge: string }> = {
  blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", iconText: "text-blue-600", badge: "text-blue-600" },
  emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconText: "text-emerald-600", badge: "text-emerald-600" },
  amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", iconText: "text-amber-600", badge: "text-amber-600" },
  red: { bg: "bg-red-50", iconBg: "bg-red-100", iconText: "text-red-600", badge: "text-red-600" },
  violet: { bg: "bg-violet-50", iconBg: "bg-violet-100", iconText: "text-violet-600", badge: "text-violet-600" },
  pink: { bg: "bg-pink-50", iconBg: "bg-pink-100", iconText: "text-pink-600", badge: "text-pink-600" },
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Unable to load dashboard stats. Make sure the database tables are created.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening across College Place Apartments.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const colors = COLOR_MAP[card.color];
          return (
            <Link
              key={card.key}
              href={card.href}
              className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center`}>
                  {card.icon}
                </div>
                {stats[card.key] && (
                  <span className={`text-xs font-medium ${colors.badge} ${colors.bg} px-2.5 py-1 rounded-full`}>
                    +{(stats[card.key] as { recent: number }).recent} this week
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.stat(stats)}</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{card.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{card.sub(stats)}</p>
            </Link>
          );
        })}
      </div>

      {/* Needs Attention */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Needs Attention</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.applications.pending > 0 && (
            <Link href="/website-app/dashboard/applications" className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.applications.pending} pending application{stats.applications.pending !== 1 ? "s" : ""}</p>
                <p className="text-xs text-gray-600">Waiting for review</p>
              </div>
            </Link>
          )}
          {stats.inquiries.new > 0 && (
            <Link href="/website-app/dashboard/inquiries" className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.inquiries.new} new inquir{stats.inquiries.new !== 1 ? "ies" : "y"}</p>
                <p className="text-xs text-gray-600">Awaiting response</p>
              </div>
            </Link>
          )}
          {stats.maintenance.open > 0 && (
            <Link href="/website-app/dashboard/maintenance" className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.maintenance.open} open maintenance request{stats.maintenance.open !== 1 ? "s" : ""}</p>
                <p className="text-xs text-gray-600">Needs attention</p>
              </div>
            </Link>
          )}
          {stats.tours.confirmed > 0 && (
            <Link href="/website-app/dashboard/tours" className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.tours.confirmed} upcoming tour{stats.tours.confirmed !== 1 ? "s" : ""}</p>
                <p className="text-xs text-gray-600">Confirmed bookings</p>
              </div>
            </Link>
          )}
          {stats.referrals.submitted > 0 && (
            <Link href="/website-app/dashboard/referrals" className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.referrals.submitted} new referral{stats.referrals.submitted !== 1 ? "s" : ""}</p>
                <p className="text-xs text-gray-600">Pending follow-up</p>
              </div>
            </Link>
          )}
          {stats.applications.pending === 0 && stats.inquiries.new === 0 && stats.maintenance.open === 0 && stats.tours.confirmed === 0 && stats.referrals.submitted === 0 && (
            <div className="col-span-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">All caught up!</p>
                <p className="text-xs text-gray-600">No items need immediate attention</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
