/**
 * Email helper using Resend API.
 * Set RESEND_API_KEY env var to enable. Silently skips if not configured.
 */

interface BookingConfirmationData {
  clientEmail: string;
  clientName: string | null;
  stylistName: string;
  stylistEmail: string;
  serviceName: string;
  startAt: string; // ISO string
  endAt: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // silently skip if not configured

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@tcgbooking.com";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromEmail, to, subject, html }),
  });
}

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
  const {
    clientEmail,
    clientName,
    stylistName,
    stylistEmail,
    serviceName,
    startAt,
  } = data;

  const dateTime = formatDateTime(startAt);
  const displayName = clientName ?? clientEmail;

  // Email to client
  const clientHtml = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 4px">Booking Confirmed</h2>
      <p style="color:#6b7280;margin:0 0 20px">Hi ${displayName}, your appointment is confirmed.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px">
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#6b7280;padding:4px 0">Stylist</td><td style="font-weight:600;text-align:right">${stylistName}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Service</td><td style="font-weight:600;text-align:right">${serviceName}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Date &amp; Time</td><td style="font-weight:600;text-align:right">${dateTime} UTC</td></tr>
        </table>
      </div>
      <p style="color:#6b7280;font-size:13px">Your appointment is pending confirmation from your stylist. You&apos;ll hear from them shortly.</p>
    </div>
  `;

  // Email to stylist
  const stylistHtml = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 4px">New Booking Request</h2>
      <p style="color:#6b7280;margin:0 0 20px">You have a new appointment request.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px">
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#6b7280;padding:4px 0">Client</td><td style="font-weight:600;text-align:right">${displayName}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Service</td><td style="font-weight:600;text-align:right">${serviceName}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Date &amp; Time</td><td style="font-weight:600;text-align:right">${dateTime} UTC</td></tr>
        </table>
      </div>
      <p style="color:#6b7280;font-size:13px">Log in to your admin dashboard to confirm or manage this appointment.</p>
    </div>
  `;

  await Promise.allSettled([
    sendEmail(clientEmail, `Your booking with ${stylistName} is confirmed`, clientHtml),
    sendEmail(stylistEmail, `New booking request from ${displayName}`, stylistHtml),
  ]);
}
