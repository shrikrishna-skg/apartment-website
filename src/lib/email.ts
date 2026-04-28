import nodemailer from "nodemailer";

// Email: collegeplacecpl@gmail.com via Gmail SMTP
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
  isVirtual?: boolean;
  joinUrl?: string | null;
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

            ${params.isVirtual && params.joinUrl ? `
            <!-- Virtual Tour Join -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:20px;text-align:center;">
                <p style="margin:0 0 12px;color:#1e3a8a;font-size:14px;font-weight:600;">This is a virtual tour via Google Meet</p>
                <p style="margin:0 0 16px;color:#374151;font-size:13px;line-height:1.6;">Use the secure link below to join at your scheduled time. The link is unique to you and expires shortly after the tour.</p>
                <a href="${params.joinUrl}" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Join Virtual Tour</a>
                <p style="margin:12px 0 0;color:#6b7280;font-size:11px;">Do not share this link — it's tied to your booking only.</p>
              </td></tr>
            </table>
            ` : ""}

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

/** Tour has been rescheduled to a new date/time */
export async function sendTourRescheduled(params: {
  to: string;
  firstName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  propertyName?: string;
  isVirtual?: boolean;
  joinUrl?: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  const oldFormatted = fmt(params.oldDate);
  const newFormatted = fmt(params.newDate);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#d97706;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">College Place</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">Apartments</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">Your Tour Has Been Rescheduled</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Hi ${escapeHtml(params.firstName)}, your apartment tour has been moved to a new time. Here are the updated details:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
              <tr><td style="padding:12px 16px;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;">
                <p style="margin:0 0 4px;color:#92400e;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Previously</p>
                <p style="margin:0;color:#6b7280;font-size:14px;text-decoration:line-through;">${oldFormatted} at ${escapeHtml(params.oldTime)}</p>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="padding:16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;">
                <p style="margin:0 0 4px;color:#065f46;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">New Time</p>
                <p style="margin:0;color:#1a1a1a;font-size:16px;font-weight:700;">${newFormatted}</p>
                <p style="margin:2px 0 0;color:#1a1a1a;font-size:16px;font-weight:700;">${escapeHtml(params.newTime)}</p>
                ${params.propertyName ? `<p style="margin:8px 0 0;color:#374151;font-size:13px;">${escapeHtml(params.propertyName)}</p>` : ""}
              </td></tr>
            </table>

            ${params.isVirtual && params.joinUrl ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:20px;text-align:center;">
                <p style="margin:0 0 12px;color:#1e3a8a;font-size:14px;font-weight:600;">This is a virtual tour via Google Meet</p>
                <a href="${params.joinUrl}" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Join Virtual Tour</a>
                <p style="margin:12px 0 0;color:#6b7280;font-size:11px;">Use this same link at your new time.</p>
              </td></tr>
            </table>` : ""}

            <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
              If this time doesn't work for you, please contact us right away:<br/>
              <strong>Phone:</strong> <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;">(615) 200-0620</a><br/>
              <strong>Email:</strong> <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;">office@collegeplace.us</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              College Place Apartments &bull; 1023 Old Lascassas Rd, Murfreesboro, TN 37130
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
    subject: `Tour Rescheduled - ${newFormatted} at ${params.newTime} | College Place Apartments`,
    html,
  });
  return info.messageId;
}

/** Tour has been cancelled */
export async function sendTourCancelled(params: {
  to: string;
  firstName: string;
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
        <tr>
          <td style="background:#dc2626;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">College Place</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">Apartments</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">Tour Cancelled</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Hi ${escapeHtml(params.firstName)}, your apartment tour has been cancelled.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 4px;color:#991b1b;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Cancelled</p>
                <p style="margin:0;color:#1a1a1a;font-size:15px;font-weight:600;text-decoration:line-through;">${formattedDate} at ${escapeHtml(params.tourTime)}</p>
                ${params.propertyName ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${escapeHtml(params.propertyName)}</p>` : ""}
              </td></tr>
            </table>

            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Still interested in finding your next home? You can schedule a new tour anytime:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0 24px;">
                <a href="https://collegeplace.us/schedule-tour" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Book a New Tour</a>
              </td></tr>
            </table>

            <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
              Questions? We're here to help:<br/>
              <strong>Phone:</strong> <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;">(615) 200-0620</a><br/>
              <strong>Email:</strong> <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;">office@collegeplace.us</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              College Place Apartments &bull; 1023 Old Lascassas Rd, Murfreesboro, TN 37130
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
    subject: `Tour Cancelled - ${formattedDate} | College Place Apartments`,
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

  const DASHBOARD_URL = "https://collegeplace.us/website-app/dashboard";

  const config = {
    tour: { label: "New Tour Booking", icon: "📅", color: "#1a73e8", bg: "#eff6ff", border: "#bfdbfe", dashPath: "/tours" },
    application: { label: "New Application", icon: "📝", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", dashPath: "/applications" },
    inquiry: { label: "New Contact Inquiry", icon: "💬", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", dashPath: "/inquiries" },
    maintenance: { label: "New Maintenance Request", icon: "🔧", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dashPath: "/maintenance" },
    referral: { label: "New Referral", icon: "🤝", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", dashPath: "/referrals" },
  };
  const c = config[params.type];

  const now = new Date().toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Chicago",
  });

  const detailLines = params.details.split("\n").filter(Boolean).map((line) => {
    const [key, ...rest] = line.split(":");
    if (rest.length > 0 && !line.startsWith("\n")) {
      return `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;vertical-align:top;">${escapeHtml(key.trim())}</td><td style="padding:6px 0;color:#1f2937;font-size:13px;font-weight:500;">${escapeHtml(rest.join(":").trim())}</td></tr>`;
    }
    return `<tr><td colspan="2" style="padding:6px 0;color:#1f2937;font-size:13px;">${escapeHtml(line.trim())}</td></tr>`;
  }).join("");

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
                  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">College Place</h1>
                  <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:1px;text-transform:uppercase;">Staff Notification</p>
                </td>
                <td align="right" valign="middle">
                  <span style="display:inline-block;padding:6px 14px;font-size:12px;font-weight:600;border-radius:20px;background:${c.bg};color:${c.color};border:1px solid ${c.border};">${c.icon} ${c.label}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Contact Info -->
        <tr>
          <td style="padding:28px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};border:1px solid ${c.border};border-radius:10px;">
              <tr>
                <td style="padding:20px;">
                  <h2 style="margin:0 0 4px;color:${c.color};font-size:16px;font-weight:700;">${c.icon} ${c.label}</h2>
                  <p style="margin:0;color:#6b7280;font-size:12px;">${now}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Person Info -->
        <tr>
          <td style="padding:20px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="color:#6b7280;font-size:13px;">Name</span><br/>
                  <span style="color:#1f2937;font-size:15px;font-weight:600;">${escapeHtml(params.name)}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                  <span style="color:#6b7280;font-size:13px;">Email</span><br/>
                  <a href="mailto:${escapeHtml(params.email)}" style="color:#1a73e8;font-size:15px;font-weight:500;text-decoration:none;">${escapeHtml(params.email)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Details -->
        <tr>
          <td style="padding:20px 32px;">
            <h3 style="margin:0 0 12px;color:#1f2937;font-size:14px;font-weight:600;">Details</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;">
              <tr><td style="padding:16px;">
                <table width="100%" cellpadding="0" cellspacing="0">${detailLines}</table>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 28px;" align="center">
            <a href="${DASHBOARD_URL}${c.dashPath}" style="display:inline-block;background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">View in Dashboard</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:11px;">
              College Place Apartments &bull; 1023 Old Lascassas Rd, Murfreesboro, TN 37130<br/>
              (615) 200-0620 &bull; office@collegeplace.us
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"College Place Website" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
    to: "office@collegeplace.us",
    subject: `${c.icon} [${c.label}] ${params.name}`,
    html,
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

// Beautiful approval email sent to applicants
export async function sendApprovalEmail(applicantName: string, applicantEmail: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Celebratory Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a73e8 0%,#4a90d9 50%,#1a73e8 100%);padding:40px 40px 32px;text-align:center;">
            <div style="font-size:48px;line-height:1;margin-bottom:12px;">&#127881; &#127881; &#127881;</div>
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">&#127881; Great News!</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.95);font-size:16px;font-weight:500;">Your Rental Application is Approved!</p>
            <div style="margin-top:16px;">
              <span style="display:inline-block;background:#22c55e;color:#ffffff;font-size:13px;font-weight:700;padding:6px 20px;border-radius:20px;letter-spacing:0.5px;">&#10004; APPROVED</span>
            </div>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;color:#1a1a1a;font-size:16px;line-height:1.6;">Dear ${escapeHtml(applicantName)},</p>

            <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
              We are excited to inform you that your application for <strong>College Place Apartments</strong> has been approved! &#127968; &#10024;
            </p>

            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              The next step is to finalize your lease agreement. Please let us know a convenient date and time for an office visit to complete this process.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 24px;">
                  <a href="https://collegeplace.us/schedule-tour" style="display:inline-block;background:linear-gradient(135deg,#1a73e8,#4a90d9);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(26,115,232,0.35);">Schedule Your Appointment</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;text-align:center;">
              If you'd prefer a walk-in appointment, you're also welcome to visit us during our office hours.
            </p>

            <!-- Office Hours Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:24px;text-align:center;">
                  <p style="margin:0 0 12px;color:#1a1a1a;font-size:15px;font-weight:700;">&#128197; Office Hours</p>
                  <p style="margin:0 0 4px;color:#374151;font-size:14px;line-height:1.8;">
                    <strong>Monday &ndash; Saturday:</strong> 9:00 AM &ndash; 5:00 PM
                  </p>
                  <p style="margin:0;color:#374151;font-size:14px;">
                    <strong>Sunday:</strong> Closed
                  </p>
                </td>
              </tr>
            </table>

            <!-- Contact Section -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:20px;">
              <tr>
                <td style="padding-top:20px;text-align:center;">
                  <p style="margin:0 0 12px;color:#1a1a1a;font-size:14px;font-weight:600;">Need help? Contact us:</p>
                  <p style="margin:0 0 6px;color:#374151;font-size:14px;">
                    &#9993; <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;font-weight:500;">office@collegeplace.us</a>
                  </p>
                  <p style="margin:0 0 16px;color:#374151;font-size:14px;">
                    &#9742; <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;font-weight:500;">(615) 200-0620</a>
                  </p>
                  <!-- Social Links -->
                  <p style="margin:0;">
                    <a href="https://www.facebook.com/collegeplace" style="display:inline-block;margin:0 6px;text-decoration:none;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="28" height="28" style="border-radius:6px;" />
                    </a>
                    <a href="https://www.instagram.com/collegeplace.us/" style="display:inline-block;margin:0 6px;text-decoration:none;">
                      <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="28" height="28" style="border-radius:6px;" />
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 6px;color:#374151;font-size:13px;font-weight:600;">Thanks &amp; Regards,</p>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Leasing Office</p>
            <p style="margin:0 0 12px;color:#6b7280;font-size:12px;">1023 Old Lascassas Rd, Murfreesboro, TN 37130</p>
            <p style="margin:0 0 12px;color:#9ca3af;font-size:11px;line-height:1.6;">
              College Place Apartments | College Center Apartments<br/>
              College Pointe Apartments | University Center Apartments
            </p>
            <p style="margin:0;color:#9ca3af;font-size:11px;">
              &copy; 2026 College Place Apartments. All Rights Reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"College Place Apartments" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
      to: applicantEmail,
      subject: "🎉 Great News! Your Rental Application is Approved — College Place Apartments",
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send approval email:", err);
    return false;
  }
}

// Reply to a contact inquiry — sends to inquirer and CC to office
export async function sendInquiryReply(params: {
  to: string;
  name: string;
  originalMessage: string;
  replyMessage: string;
  inquiryType?: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const replyHtml = escapeHtml(params.replyMessage).replace(/\n/g, "<br/>");
  const originalHtml = escapeHtml(params.originalMessage).replace(/\n/g, "<br/>");

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
            <p style="margin:0 0 20px;color:#1a1a1a;font-size:16px;line-height:1.6;">Hi ${escapeHtml(params.name)},</p>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Thank you for reaching out to College Place Apartments. Here is our response to your inquiry:
            </p>

            <!-- Reply -->
            <div style="padding:20px 24px;background:#eff6ff;border-left:4px solid #1a73e8;border-radius:0 10px 10px 0;margin-bottom:24px;">
              <p style="margin:0;color:#1e3a5f;font-size:14px;line-height:1.7;">${replyHtml}</p>
            </div>

            <!-- Original message -->
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600;">Your original message:</p>
            <div style="padding:16px 20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;font-style:italic;">${originalHtml}</p>
            </div>

            <!-- Contact -->
            <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
              Have more questions? Feel free to reply to this email or contact us:<br/>
              <strong>Phone:</strong> <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;">(615) 200-0620</a><br/>
              <strong>Email:</strong> <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;">office@collegeplace.us</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 6px;color:#374151;font-size:13px;font-weight:600;">Thanks &amp; Regards,</p>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Leasing Office</p>
            <p style="margin:0 0 12px;color:#6b7280;font-size:12px;">1023 Old Lascassas Rd, Murfreesboro, TN 37130</p>
            <p style="margin:0;color:#9ca3af;font-size:11px;">
              Monday - Saturday: 9am - 5pm &bull; Sunday: Closed
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const fromAddress = process.env.SMTP_USER || process.env.GMAIL_USER;
  const info = await transporter.sendMail({
    from: `"College Place Apartments" <${fromAddress}>`,
    to: params.to,
    cc: "office@collegeplace.us",
    replyTo: "office@collegeplace.us",
    subject: `Re: Your inquiry to College Place Apartments`,
    html,
  });

  return info.messageId;
}

// Auto-sent when a maintenance request is received
export async function sendApplicationReceived(params: {
  to: string;
  name: string;
  applicantType?: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const typeLabel =
    params.applicantType === "student" ? "Student"
    : params.applicantType === "international" ? "International Student"
    : params.applicantType === "working" ? "Working Professional"
    : "General";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#1a73e8;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">College Place</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">Apartments</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">Application Received</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Dear ${escapeHtml(params.name)},
            </p>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Thank you for submitting your rental application with College Place Apartments. We have received your application and our leasing team will review the details shortly. You can expect to hear back from us within <strong>1&ndash;2 business days</strong>.
            </p>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              If we need any additional information to complete your review, we'll reach out using the contact details you provided.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;width:160px;">Applicant</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${escapeHtml(params.name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;">Application Type</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${escapeHtml(typeLabel)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;">Status</td>
                    <td style="padding:6px 0;color:#1a73e8;font-size:14px;font-weight:700;">Under Review</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
              Questions in the meantime?<br/>
              <strong>Phone:</strong> <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;">(615) 200-0620</a><br/>
              <strong>Email:</strong> <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;">office@collegeplace.us</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 6px;color:#374151;font-size:13px;font-weight:600;">Thanks &amp; Regards,</p>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Leasing Office</p>
            <p style="margin:0;color:#9ca3af;font-size:12px;">College Place Apartments &bull; 1023 Old Lascassas Rd, Murfreesboro, TN 37130</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const fromAddress = process.env.SMTP_USER || process.env.GMAIL_USER;
  const info = await transporter.sendMail({
    from: `"College Place Apartments" <${fromAddress}>`,
    to: params.to,
    cc: "office@collegeplace.us",
    subject: "Application Received — College Place Apartments",
    html,
  });

  return info.messageId;
}

export async function sendMaintenanceReceived(params: {
  to: string;
  name: string;
  apartment: string;
  description: string;
  category?: string | null;
  urgency?: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#1a73e8;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">College Place</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">Apartments</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">Maintenance Request Received</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Dear ${escapeHtml(params.name)},
            </p>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;text-align:justify;">
              Thank you for reaching out to us about the maintenance issue in your unit. We have recorded your request and our maintenance team will be addressing it during business hours. We appreciate your patience and will keep you informed once the work has been scheduled or completed.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">Unit</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${escapeHtml(params.apartment)}</td>
                  </tr>
                  ${params.category ? `<tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;">Category</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${escapeHtml(params.category)}</td>
                  </tr>` : ""}
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;">Urgency</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${escapeHtml((params.urgency || "medium").charAt(0).toUpperCase() + (params.urgency || "medium").slice(1))}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;vertical-align:top;">Issue</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;">${escapeHtml(params.description).replace(/\n/g, "<br/>")}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
              If your issue is urgent or requires immediate attention, please contact us directly:<br/>
              <strong>Phone:</strong> <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;">(615) 200-0620</a><br/>
              <strong>Email:</strong> <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;">office@collegeplace.us</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 6px;color:#374151;font-size:13px;font-weight:600;">Thanks &amp; Regards,</p>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Maintenance Team</p>
            <p style="margin:0;color:#9ca3af;font-size:12px;">College Place Apartments &bull; 1023 Old Lascassas Rd, Murfreesboro, TN 37130</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const fromAddress = process.env.SMTP_USER || process.env.GMAIL_USER;
  const info = await transporter.sendMail({
    from: `"College Place Apartments" <${fromAddress}>`,
    to: params.to,
    cc: "office@collegeplace.us",
    subject: "Maintenance Request Received — College Place Apartments",
    html,
  });

  return info.messageId;
}

// Sent when maintenance is marked as completed/resolved
export async function sendMaintenanceCompleted(params: {
  to: string;
  name: string;
  apartment: string;
  description: string;
  resolutionNotes?: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const notes = params.resolutionNotes?.trim();
  const notesBlock = notes
    ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">Notes from our team</p>
                <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.6;">${escapeHtml(notes).replace(/\n/g, "<br/>")}</p>
              </td></tr>
            </table>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#16a34a;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">College Place</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">Apartments</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;">Maintenance Completion Notice</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              Dear ${escapeHtml(params.name)},
            </p>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
              The maintenance work in your unit has been completed. Please check and let us know if you have any further concerns.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">Unit</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${escapeHtml(params.apartment)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;vertical-align:top;">Issue</td>
                    <td style="padding:6px 0;color:#1a1a1a;font-size:14px;">${escapeHtml(params.description).replace(/\n/g, "<br/>")}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6b7280;font-size:14px;">Status</td>
                    <td style="padding:6px 0;color:#16a34a;font-size:14px;font-weight:700;">Completed</td>
                  </tr>
                </table>
              </td></tr>
            </table>
            ${notesBlock}
            <p style="margin:0;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.6;">
              If you have any further concerns, please don&rsquo;t hesitate to contact us:<br/>
              <strong>Phone:</strong> <a href="tel:6152000620" style="color:#1a73e8;text-decoration:none;">(615) 200-0620</a><br/>
              <strong>Email:</strong> <a href="mailto:office@collegeplace.us" style="color:#1a73e8;text-decoration:none;">office@collegeplace.us</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 6px;color:#374151;font-size:13px;font-weight:600;">Thanks &amp; Regards,</p>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Maintenance Team</p>
            <p style="margin:0;color:#9ca3af;font-size:12px;">College Place Apartments &bull; 1023 Old Lascassas Rd, Murfreesboro, TN 37130</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const fromAddress = process.env.SMTP_USER || process.env.GMAIL_USER;
  const info = await transporter.sendMail({
    from: `"College Place Apartments" <${fromAddress}>`,
    to: params.to,
    cc: "office@collegeplace.us",
    subject: "Maintenance Completion Notice — College Place Apartments",
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

/** Send OTP verification code to office email for admin login */
export async function sendOTPEmail(code: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"College Place Apartments" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
      to: "office@collegeplace.us",
      subject: `Staff Login OTP: ${code}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="margin:0;font-size:20px;color:#1f2937;">Staff Login Verification</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">College Place Apartments</p>
          </div>
          <div style="text-align:center;background:#f0f7ff;border:2px dashed #3b82f6;border-radius:12px;padding:24px;margin:20px 0;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
            <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:8px;color:#1e40af;font-family:monospace;">${code}</p>
          </div>
          <p style="font-size:13px;color:#6b7280;text-align:center;margin:16px 0 0;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="font-size:11px;color:#9ca3af;text-align:center;margin:0;">If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return false;
  }
}

/** Send login notification with IP and device details to office email */
export async function sendLoginNotification(params: {
  username: string;
  ip: string;
  userAgent: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }) + " CT";

  try {
    await transporter.sendMail({
      from: `"College Place Apartments" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
      to: "office@collegeplace.us",
      subject: `Staff Login Alert — ${params.username}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">Staff Dashboard Login</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#4b5563;">A staff member has successfully logged into the dashboard.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;width:120px;">User</td>
              <td style="padding:10px 0;color:#1f2937;font-weight:600;">${escapeHtml(params.username)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;">Time</td>
              <td style="padding:10px 0;color:#1f2937;">${now}</td>
            </tr>
            <tr style="border-bottom:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;">IP Address</td>
              <td style="padding:10px 0;color:#1f2937;font-family:monospace;">${escapeHtml(params.ip)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Device</td>
              <td style="padding:10px 0;color:#1f2937;font-size:13px;word-break:break-all;">${escapeHtml(params.userAgent)}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <p style="font-size:11px;color:#9ca3af;margin:0;">If this login was not authorized, please change your credentials immediately.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Failed to send login notification:", err);
    return false;
  }
}
