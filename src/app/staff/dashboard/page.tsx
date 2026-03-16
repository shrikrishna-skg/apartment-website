"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── types ─── */
interface Application {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  applicant_type: string;
  status: string;
  created_at: string;
  housing_requirement?: string;
  preferred_move_in?: string;
  lease_duration?: string;
  university_name?: string;
  city?: string;
  state?: string;
  [key: string]: unknown;
}

interface TourBooking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_slug: string;
  floor_plan: string;
  tour_date: string;
  tour_time: string;
  notes?: string;
  status: string;
  created_at: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
}

type Tab = "overview" | "applications" | "tours" | "inquiries";

/* ─── status config ─── */
const APP_STATUSES = ["pending", "reviewing", "approved", "denied", "withdrawn"];
const TOUR_STATUSES = ["confirmed", "completed", "cancelled", "no_show"];
const INQUIRY_STATUSES = ["new", "contacted", "resolved", "archived"];

function statusColor(status: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    pending: { bg: "#fef9c3", text: "#854d0e" },
    reviewing: { bg: "#dbeafe", text: "#1e40af" },
    approved: { bg: "#dcfce7", text: "#166534" },
    denied: { bg: "#fee2e2", text: "#991b1b" },
    withdrawn: { bg: "#f3f4f6", text: "#374151" },
    confirmed: { bg: "#dbeafe", text: "#1e40af" },
    completed: { bg: "#dcfce7", text: "#166534" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
    no_show: { bg: "#fef9c3", text: "#854d0e" },
    new: { bg: "#dbeafe", text: "#1e40af" },
    contacted: { bg: "#fef9c3", text: "#854d0e" },
    resolved: { bg: "#dcfce7", text: "#166534" },
    archived: { bg: "#f3f4f6", text: "#6b7280" },
  };
  return map[status] || { bg: "#f3f4f6", text: "#374151" };
}

/* ─── reusable styles ─── */
const tableHeaderStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
  whiteSpace: "nowrap",
};

const tableCellStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  whiteSpace: "nowrap",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  overflow: "hidden",
};

/* ─── component ─── */
export default function StaffDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [applications, setApplications] = useState<Application[]>([]);
  const [tours, setTours] = useState<TourBooking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [expandedTour, setExpandedTour] = useState<string | null>(null);
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* auth check */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("staff_auth");
      if (auth !== "true") {
        router.push("/staff");
      }
    }
  }, [router]);

  /* fetch data */
  const fetchData = useCallback(async () => {
    try {
      const [appsRes, toursRes, inquiriesRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/tour-bookings"),
        fetch("/api/contact"),
      ]);

      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(Array.isArray(data) ? data : []);
      }
      if (toursRes.ok) {
        const data = await toursRes.json();
        setTours(Array.isArray(data) ? data : []);
      }
      if (inquiriesRes.ok) {
        const data = await inquiriesRes.json();
        setInquiries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  /* status update helpers */
  const updateApplicationStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      }
    } catch (err) {
      console.error("Failed to update application status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateTourStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/tour-bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTours((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status } : t))
        );
      }
    } catch (err) {
      console.error("Failed to update tour status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status } : i))
        );
      }
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("staff_auth");
    router.push("/staff");
  };

  /* computed stats */
  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const upcomingTours = tours.filter(
    (t) => t.status === "confirmed" && new Date(t.tour_date) >= new Date()
  ).length;
  const newInquiries = inquiries.filter(
    (i) => i.status === "new" || !i.status
  ).length;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatSlug = (slug: string) => {
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  /* ─── tabs config ─── */
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "applications", label: "Applications", count: applications.length },
    { key: "tours", label: "Tour Bookings", count: tours.length },
    { key: "inquiries", label: "Inquiries", count: inquiries.length },
  ];

  /* ─── status badge ─── */
  const StatusBadge = ({ status }: { status: string }) => {
    const { bg, text } = statusColor(status);
    return (
      <span
        style={{
          display: "inline-block",
          padding: "0.2rem 0.625rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: bg,
          color: text,
          textTransform: "capitalize",
        }}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  /* ─── status dropdown ─── */
  const StatusSelect = ({
    value,
    options,
    disabled,
    onChange,
  }: {
    value: string;
    options: string[];
    disabled: boolean;
    onChange: (v: string) => void;
  }) => (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "0.35rem 0.5rem",
        fontSize: "0.8125rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        background: disabled ? "#f9fafb" : "#fff",
        color: "#374151",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        minWidth: "110px",
      }}
    >
      {options.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ").charAt(0).toUpperCase() +
            s.replace("_", " ").slice(1)}
        </option>
      ))}
    </select>
  );

  /* ─── render ─── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#1a73e8",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Loading dashboard...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* ── Header ── */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 1.5rem",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#1a73e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Staff Dashboard
              </h1>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                College Place Apartments
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "#6b7280",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.borderColor = "#fecaca";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Tab Nav ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 1.5rem",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            gap: "0",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.875rem 1.25rem",
                fontSize: "0.8125rem",
                fontWeight: activeTab === tab.key ? 600 : 500,
                color: activeTab === tab.key ? "#1a73e8" : "#6b7280",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #1a73e8"
                    : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    padding: "0.1rem 0.5rem",
                    borderRadius: "9999px",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    background:
                      activeTab === tab.key ? "#eff6ff" : "#f3f4f6",
                    color: activeTab === tab.key ? "#1a73e8" : "#9ca3af",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem" }}>
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Pending Applications Card */}
              <div
                style={{
                  ...cardStyle,
                  padding: "1.5rem",
                  cursor: "pointer",
                }}
                onClick={() => setActiveTab("applications")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "#6b7280",
                    }}
                  >
                    Pending Applications
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#fef9c3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#854d0e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {pendingApps}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    margin: "0.25rem 0 0",
                  }}
                >
                  of {applications.length} total
                </p>
              </div>

              {/* Upcoming Tours Card */}
              <div
                style={{
                  ...cardStyle,
                  padding: "1.5rem",
                  cursor: "pointer",
                }}
                onClick={() => setActiveTab("tours")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "#6b7280",
                    }}
                  >
                    Upcoming Tours
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1e40af"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {upcomingTours}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    margin: "0.25rem 0 0",
                  }}
                >
                  of {tours.length} total
                </p>
              </div>

              {/* New Inquiries Card */}
              <div
                style={{
                  ...cardStyle,
                  padding: "1.5rem",
                  cursor: "pointer",
                }}
                onClick={() => setActiveTab("inquiries")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "#6b7280",
                    }}
                  >
                    New Inquiries
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#166534"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {newInquiries}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    margin: "0.25rem 0 0",
                  }}
                >
                  of {inquiries.length} total
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={cardStyle}>
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <h2
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Recent Activity
                </h2>
              </div>
              <div style={{ padding: "0.5rem 0" }}>
                {[
                  ...applications.slice(0, 3).map((a) => ({
                    type: "Application",
                    name: a.full_name,
                    status: a.status,
                    date: a.created_at,
                  })),
                  ...tours.slice(0, 3).map((t) => ({
                    type: "Tour",
                    name: `${t.first_name} ${t.last_name}`,
                    status: t.status,
                    date: t.created_at,
                  })),
                  ...inquiries.slice(0, 3).map((i) => ({
                    type: "Inquiry",
                    name: i.name,
                    status: i.status || "new",
                    date: i.created_at,
                  })),
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .slice(0, 8)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1.25rem",
                        borderBottom:
                          idx < 7 ? "1px solid #f9fafb" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            background:
                              item.type === "Application"
                                ? "#eff6ff"
                                : item.type === "Tour"
                                ? "#f0fdf4"
                                : "#fefce8",
                            color:
                              item.type === "Application"
                                ? "#1a73e8"
                                : item.type === "Tour"
                                ? "#166534"
                                : "#854d0e",
                          }}
                        >
                          {item.type}
                        </span>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "#374151",
                            fontWeight: 500,
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <StatusBadge status={item.status} />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                            minWidth: "80px",
                            textAlign: "right",
                          }}
                        >
                          {formatDate(item.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                {applications.length === 0 &&
                  tours.length === 0 &&
                  inquiries.length === 0 && (
                    <div
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "0.875rem",
                      }}
                    >
                      No activity yet. Data will appear here as submissions come
                      in.
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {activeTab === "applications" && (
          <div style={cardStyle}>
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Applications
              </h2>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "#9ca3af",
                }}
              >
                {applications.length} total
              </span>
            </div>

            {applications.length === 0 ? (
              <div
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <p style={{ fontSize: "0.9375rem", margin: 0 }}>
                  No applications yet.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Name</th>
                      <th style={tableHeaderStyle}>Email</th>
                      <th style={tableHeaderStyle}>Phone</th>
                      <th style={tableHeaderStyle}>Type</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Date</th>
                      <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <>
                        <tr
                          key={app.id}
                          style={{
                            cursor: "pointer",
                            background:
                              expandedApp === app.id
                                ? "#f9fafb"
                                : "transparent",
                            transition: "background 0.1s",
                          }}
                          onClick={() =>
                            setExpandedApp(
                              expandedApp === app.id ? null : app.id
                            )
                          }
                          onMouseEnter={(e) => {
                            if (expandedApp !== app.id)
                              e.currentTarget.style.background = "#fafafa";
                          }}
                          onMouseLeave={(e) => {
                            if (expandedApp !== app.id)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td style={tableCellStyle}>
                            <span style={{ fontWeight: 500 }}>
                              {app.full_name}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{app.email}</td>
                          <td style={tableCellStyle}>{app.mobile_number}</td>
                          <td style={tableCellStyle}>
                            <span style={{ textTransform: "capitalize" }}>
                              {app.applicant_type || "General"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <StatusBadge status={app.status} />
                          </td>
                          <td style={tableCellStyle}>
                            {formatDate(app.created_at)}
                          </td>
                          <td
                            style={tableCellStyle}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <StatusSelect
                              value={app.status}
                              options={APP_STATUSES}
                              disabled={updatingId === app.id}
                              onChange={(s) =>
                                updateApplicationStatus(app.id, s)
                              }
                            />
                          </td>
                        </tr>
                        {expandedApp === app.id && (
                          <tr key={`${app.id}-detail`}>
                            <td
                              colSpan={7}
                              style={{
                                padding: "1rem 1.5rem 1.25rem",
                                background: "#f9fafb",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 600,
                                  color: "#374151",
                                  marginBottom: "0.75rem",
                                }}
                              >
                                Full Application Details
                              </p>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(220px, 1fr))",
                                  gap: "0.5rem 1.5rem",
                                }}
                              >
                                {Object.entries(app)
                                  .filter(
                                    ([key]) =>
                                      !["id", "created_at", "updated_at"].includes(
                                        key
                                      )
                                  )
                                  .map(([key, value]) => (
                                    <div key={key}>
                                      <span
                                        style={{
                                          fontSize: "0.6875rem",
                                          color: "#9ca3af",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.05em",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {key.replace(/_/g, " ")}
                                      </span>
                                      <p
                                        style={{
                                          fontSize: "0.8125rem",
                                          color: "#374151",
                                          margin: "0.125rem 0 0",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {String(value ?? "N/A")}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TOURS TAB ── */}
        {activeTab === "tours" && (
          <div style={cardStyle}>
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Tour Bookings
              </h2>
              <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>
                {tours.length} total
              </span>
            </div>

            {tours.length === 0 ? (
              <div
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <p style={{ fontSize: "0.9375rem", margin: 0 }}>
                  No tour bookings yet.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{ width: "100%", borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Name</th>
                      <th style={tableHeaderStyle}>Email</th>
                      <th style={tableHeaderStyle}>Property</th>
                      <th style={tableHeaderStyle}>Date</th>
                      <th style={tableHeaderStyle}>Time</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tours.map((tour) => (
                      <>
                        <tr
                          key={tour.id}
                          style={{
                            cursor: "pointer",
                            background:
                              expandedTour === tour.id
                                ? "#f9fafb"
                                : "transparent",
                            transition: "background 0.1s",
                          }}
                          onClick={() =>
                            setExpandedTour(
                              expandedTour === tour.id ? null : tour.id
                            )
                          }
                          onMouseEnter={(e) => {
                            if (expandedTour !== tour.id)
                              e.currentTarget.style.background = "#fafafa";
                          }}
                          onMouseLeave={(e) => {
                            if (expandedTour !== tour.id)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td style={tableCellStyle}>
                            <span style={{ fontWeight: 500 }}>
                              {tour.first_name} {tour.last_name}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{tour.email}</td>
                          <td style={tableCellStyle}>
                            {formatSlug(tour.property_slug)}
                          </td>
                          <td style={tableCellStyle}>
                            {formatDate(tour.tour_date)}
                          </td>
                          <td style={tableCellStyle}>{tour.tour_time}</td>
                          <td style={tableCellStyle}>
                            <StatusBadge status={tour.status} />
                          </td>
                          <td
                            style={tableCellStyle}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <StatusSelect
                              value={tour.status}
                              options={TOUR_STATUSES}
                              disabled={updatingId === tour.id}
                              onChange={(s) =>
                                updateTourStatus(tour.id, s)
                              }
                            />
                          </td>
                        </tr>
                        {expandedTour === tour.id && (
                          <tr key={`${tour.id}-detail`}>
                            <td
                              colSpan={7}
                              style={{
                                padding: "1rem 1.5rem 1.25rem",
                                background: "#f9fafb",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(200px, 1fr))",
                                  gap: "0.75rem 1.5rem",
                                }}
                              >
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: "#9ca3af",
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Phone
                                  </span>
                                  <p
                                    style={{
                                      fontSize: "0.8125rem",
                                      color: "#374151",
                                      margin: "0.125rem 0 0",
                                    }}
                                  >
                                    {tour.phone}
                                  </p>
                                </div>
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: "#9ca3af",
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Floor Plan
                                  </span>
                                  <p
                                    style={{
                                      fontSize: "0.8125rem",
                                      color: "#374151",
                                      margin: "0.125rem 0 0",
                                    }}
                                  >
                                    {tour.floor_plan}
                                  </p>
                                </div>
                                {tour.notes && (
                                  <div
                                    style={{
                                      gridColumn: "1 / -1",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.6875rem",
                                        color: "#9ca3af",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Notes
                                    </span>
                                    <p
                                      style={{
                                        fontSize: "0.8125rem",
                                        color: "#374151",
                                        margin: "0.125rem 0 0",
                                      }}
                                    >
                                      {tour.notes}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <span
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: "#9ca3af",
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Booked On
                                  </span>
                                  <p
                                    style={{
                                      fontSize: "0.8125rem",
                                      color: "#374151",
                                      margin: "0.125rem 0 0",
                                    }}
                                  >
                                    {formatDate(tour.created_at)}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── INQUIRIES TAB ── */}
        {activeTab === "inquiries" && (
          <div style={cardStyle}>
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Contact Inquiries
              </h2>
              <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>
                {inquiries.length} total
              </span>
            </div>

            {inquiries.length === 0 ? (
              <div
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <p style={{ fontSize: "0.9375rem", margin: 0 }}>
                  No inquiries yet.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{ width: "100%", borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Name</th>
                      <th style={tableHeaderStyle}>Email</th>
                      <th style={tableHeaderStyle}>Type</th>
                      <th style={tableHeaderStyle}>Message</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Date</th>
                      <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inq) => (
                      <>
                        <tr
                          key={inq.id}
                          style={{
                            cursor: "pointer",
                            background:
                              expandedInquiry === inq.id
                                ? "#f9fafb"
                                : "transparent",
                            transition: "background 0.1s",
                          }}
                          onClick={() =>
                            setExpandedInquiry(
                              expandedInquiry === inq.id ? null : inq.id
                            )
                          }
                          onMouseEnter={(e) => {
                            if (expandedInquiry !== inq.id)
                              e.currentTarget.style.background = "#fafafa";
                          }}
                          onMouseLeave={(e) => {
                            if (expandedInquiry !== inq.id)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td style={tableCellStyle}>
                            <span style={{ fontWeight: 500 }}>
                              {inq.name}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{inq.email}</td>
                          <td style={tableCellStyle}>
                            <span style={{ textTransform: "capitalize" }}>
                              {inq.inquiry_type}
                            </span>
                          </td>
                          <td
                            style={{
                              ...tableCellStyle,
                              maxWidth: "250px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {inq.message.length > 60
                              ? inq.message.slice(0, 60) + "..."
                              : inq.message}
                          </td>
                          <td style={tableCellStyle}>
                            <StatusBadge status={inq.status || "new"} />
                          </td>
                          <td style={tableCellStyle}>
                            {formatDate(inq.created_at)}
                          </td>
                          <td
                            style={tableCellStyle}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <StatusSelect
                              value={inq.status || "new"}
                              options={INQUIRY_STATUSES}
                              disabled={updatingId === inq.id}
                              onChange={(s) =>
                                updateInquiryStatus(inq.id, s)
                              }
                            />
                          </td>
                        </tr>
                        {expandedInquiry === inq.id && (
                          <tr key={`${inq.id}-detail`}>
                            <td
                              colSpan={7}
                              style={{
                                padding: "1rem 1.5rem 1.25rem",
                                background: "#f9fafb",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(200px, 1fr))",
                                  gap: "0.75rem 1.5rem",
                                }}
                              >
                                {inq.phone && (
                                  <div>
                                    <span
                                      style={{
                                        fontSize: "0.6875rem",
                                        color: "#9ca3af",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Phone
                                    </span>
                                    <p
                                      style={{
                                        fontSize: "0.8125rem",
                                        color: "#374151",
                                        margin: "0.125rem 0 0",
                                      }}
                                    >
                                      {inq.phone}
                                    </p>
                                  </div>
                                )}
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <span
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: "#9ca3af",
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Full Message
                                  </span>
                                  <p
                                    style={{
                                      fontSize: "0.8125rem",
                                      color: "#374151",
                                      margin: "0.125rem 0 0",
                                      lineHeight: 1.6,
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {inq.message}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
