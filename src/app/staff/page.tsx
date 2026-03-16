"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STAFF_PIN = "1234";

export default function StaffLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (pin === STAFF_PIN) {
      localStorage.setItem("staff_auth", "true");
      router.push("/staff/dashboard");
    } else {
      setError("Invalid PIN. Please try again.");
      setPin("");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.04)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#1a73e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 0.25rem",
            }}
          >
            Staff Portal
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
            Enter your PIN to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.375rem",
              }}
            >
              Staff PIN
            </label>
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="Enter 4-digit PIN"
              autoFocus
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "1.125rem",
                letterSpacing: "0.25em",
                textAlign: "center",
                border: `1.5px solid ${error ? "#ef4444" : "#d1d5db"}`,
                borderRadius: "10px",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
                background: "#fafafa",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = "#1a73e8";
                  e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)";
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "0.625rem 0.875rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                marginBottom: "1.25rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#dc2626",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "#fff",
              background:
                pin.length !== 4 || loading ? "#93c5fd" : "#1a73e8",
              border: "none",
              borderRadius: "10px",
              cursor:
                pin.length !== 4 || loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#9ca3af",
            marginTop: "1.5rem",
          }}
        >
          Authorized staff only
        </p>
      </div>
    </div>
  );
}
