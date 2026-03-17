import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("Email not configured: SMTP_USER/SMTP_PASS not set");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendTourConfirmation(params: {
  to: string;
  firstName: string;
  lastName: string;
  tourDate: string;
  tourTime: string;
  propertyName?: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const formattedDate = new Date(params.tourDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:#1a73e8;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">College Place</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">Apartments</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">Tour Confirmed!</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.5;">
              Hi ${params.firstName}, your apartment tour has been scheduled. We look forward to meeting you!
            </p>

            <!-- Details Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
              <tr>
                <td style="padding:24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">Date</td>
                      <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;">Time</td>
                      <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${params.tourTime}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;">Location</td>
                      <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">1023 Old Lascassas Rd, Murfreesboro, TN 37130</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;">Duration</td>
                      <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">~10 minutes</td>
                    </tr>
                    ${params.propertyName ? `<tr>
                      <td style="padding:6px 0;color:#6b7280;font-size:14px;">Property</td>
                      <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${params.propertyName}</td>
                    </tr>` : ""}
                  </table>
                </td>
              </tr>
            </table>

            <!-- What to Expect -->
            <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:16px;">What to Expect</h3>
            <ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;font-size:14px;line-height:2;">
              <li>Tour the apartment and common areas</li>
              <li>Review available floor plans and pricing</li>
              <li>Discuss lease terms and move-in dates</li>
              <li>Ask questions about the community</li>
            </ul>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0;">
                  <a href="https://maps.google.com/?q=1023+Old+Lascassas+Rd+Murfreesboro+TN+37130" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Get Directions</a>
                </td>
              </tr>
            </table>

            <!-- Contact -->
            <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
              Need to reschedule or have questions? Contact us:<br/>
              <strong>Phone:</strong> <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;">(615) 200-0620</a><br/>
              <strong>Email:</strong> <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;">office@collegeplace.us</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              College Place Apartments &bull; 1023 Old Lascassas Rd, Murfreesboro, TN 37130<br/>
              Monday - Saturday: 9am - 5pm &bull; Sunday: Closed
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"College Place Apartments" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
    to: params.to,
    subject: `Tour Confirmed - ${formattedDate} at ${params.tourTime} | College Place Apartments`,
    html,
  });

  return info.messageId;
}

export async function sendStaffNotification(params: {
  type: "tour" | "application" | "inquiry" | "maintenance" | "referral";
  name: string;
  email: string;
  details: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const subjectMap = {
    tour: "New Tour Booking",
    application: "New Application",
    inquiry: "New Contact Inquiry",
    maintenance: "New Maintenance Request",
    referral: "New Referral",
  };

  const info = await transporter.sendMail({
    from: `"College Place Website" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
    to: "office@collegeplace.us",
    subject: `[${subjectMap[params.type]}] ${params.name}`,
    html: `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#1a73e8;">${subjectMap[params.type]}</h2>
        <p><strong>Name:</strong> ${params.name}</p>
        <p><strong>Email:</strong> ${params.email}</p>
        <pre style="background:#f4f4f5;padding:16px;border-radius:8px;white-space:pre-wrap;">${params.details}</pre>
        <p style="color:#6b7280;font-size:13px;margin-top:20px;">
          View in <a href="https://collegeplace.us/website-app/dashboard" style="color:#1a73e8;">Staff Dashboard</a>
        </p>
      </div>
    `,
  });

  return info.messageId;
}

// Professional HTML ticket email for AI chatbot tickets
export async function sendTicketEmail(params: {
  ticketId: string;
  urgency: "emergency" | "high" | "normal";
  category: "chat-auto" | "chat-confirmed" | "image-report";
  userName: string;
  userEmail: string;
  unitInfo?: string | null;
  preferredTime?: string | null;
  availability?: string | null;
  summary: string;
  conversation: string;
  aiResponse: string;
  hasImage?: boolean;
  imageDescription?: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const urgencyConfig = {
    emergency: { label: "EMERGENCY", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    high: { label: "HIGH PRIORITY", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    normal: { label: "Normal", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  };
  const urg = urgencyConfig[params.urgency];

  const now = new Date().toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  });

  // Build detail rows
  const detailRows = [
    { label: "Ticket ID", value: params.ticketId, bold: true },
    { label: "Created", value: now },
    { label: "Resident", value: params.userName },
    { label: "Email", value: params.userEmail !== "N/A" && params.userEmail !== "via-chatbot" ? params.userEmail : "Not provided" },
    params.unitInfo ? { label: "Unit", value: params.unitInfo } : null,
    params.preferredTime ? { label: "Best Time to Contact", value: params.preferredTime } : null,
    params.availability ? { label: "Availability Note", value: params.availability } : null,
    params.hasImage ? { label: "Photo Attached", value: "Yes — see AI analysis below" } : null,
  ].filter(Boolean) as { label: string; value: string; bold?: boolean }[];

  // Format conversation nicely
  const conversationHtml = params.conversation
    .split("\n")
    .map((line) => {
      if (line.startsWith("user:")) {
        return `<div style="margin:8px 0;padding:10px 14px;background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 6px 6px 0;font-size:13px;color:#1e3a5f;"><strong>Resident:</strong> ${escapeHtml(line.replace(/^user:\s*/, ""))}</div>`;
      }
      if (line.startsWith("assistant:")) {
        return `<div style="margin:8px 0;padding:10px 14px;background:#f9fafb;border-left:3px solid #d1d5db;border-radius:0 6px 6px 0;font-size:13px;color:#374151;"><strong>AI Assistant:</strong> ${escapeHtml(line.replace(/^assistant:\s*/, ""))}</div>`;
      }
      return `<div style="margin:4px 0;font-size:13px;color:#6b7280;">${escapeHtml(line)}</div>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#1a73e8;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Support Ticket</h1>
                  <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:0.5px;">College Place Apartments • AI Chatbot</p>
                </td>
                <td align="right" valign="middle">
                  <span style="display:inline-block;padding:6px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;border-radius:20px;background:${urg.bg};color:${urg.color};border:1px solid ${urg.border};">${urg.label}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Issue Summary -->
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 6px;color:#1f2937;font-size:16px;font-weight:600;">Issue Summary</h2>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">${escapeHtml(params.summary)}</p>
          </td>
        </tr>

        <!-- Details Card -->
        <tr>
          <td style="padding:20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;">
              <tr>
                <td style="padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${detailRows.map((row) => `
                    <tr>
                      <td style="padding:7px 0;color:#6b7280;font-size:13px;width:160px;vertical-align:top;">${row.label}</td>
                      <td style="padding:7px 0;color:#1f2937;font-size:13px;font-weight:${row.bold ? "700" : "500"};">${escapeHtml(row.value)}</td>
                    </tr>`).join("")}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Conversation -->
        <tr>
          <td style="padding:0 32px 8px;">
            <h3 style="margin:0 0 12px;color:#1f2937;font-size:14px;font-weight:600;">Chat Conversation</h3>
            ${conversationHtml}
          </td>
        </tr>

        ${params.aiResponse ? `
        <!-- AI Response -->
        <tr>
          <td style="padding:16px 32px;">
            <h3 style="margin:0 0 8px;color:#1f2937;font-size:14px;font-weight:600;">AI Assistant Response</h3>
            <div style="padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#166534;line-height:1.6;">
              ${escapeHtml(params.aiResponse)}
            </div>
          </td>
        </tr>
        ` : ""}

        ${params.imageDescription ? `
        <!-- Image Analysis -->
        <tr>
          <td style="padding:0 32px 16px;">
            <h3 style="margin:0 0 8px;color:#1f2937;font-size:14px;font-weight:600;">📷 Photo Analysis (AI)</h3>
            <div style="padding:14px 16px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#854d0e;line-height:1.6;">
              ${escapeHtml(params.imageDescription)}
            </div>
          </td>
        </tr>
        ` : ""}

        <!-- Action -->
        <tr>
          <td style="padding:8px 32px 24px;" align="center">
            <a href="https://collegeplace.us/website-app/dashboard" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">View in Dashboard</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:11px;">
              Auto-generated by College Place AI Assistant • ${now}<br/>
              1023 Old Lascassas Rd, Murfreesboro, TN 37130 • (615) 200-0620
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const subjectPrefix = params.urgency === "emergency" ? "🚨 EMERGENCY" : params.urgency === "high" ? "⚡ HIGH" : "📋";
  const categoryLabel = params.category === "image-report" ? "Photo Report" : params.category === "chat-confirmed" ? "Confirmed Ticket" : "Support Ticket";

  const info = await transporter.sendMail({
    from: `"College Place AI Assistant" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
    to: "office@collegeplace.us",
    subject: `${subjectPrefix} [${categoryLabel}] ${params.ticketId} — ${params.summary.slice(0, 60)}`,
    html,
  });

  return info.messageId;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
