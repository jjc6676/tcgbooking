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

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

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
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#faf8f5">
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#f5ede8,#e8d8d0);display:inline-flex;align-items:center;justify-content:center;border:2px solid #e8e2dc;margin-bottom:12px">
          <span style="font-size:24px;color:#9b6f6f;font-weight:600">K</span>
        </div>
        <h2 style="margin:0;font-size:22px;color:#1a1714;font-family:Georgia,serif">Request Received ✨</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#8a7e78;font-family:sans-serif">Hi ${displayName}, your request has been sent to Keri!</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e8e2dc;border-radius:16px;padding:20px;margin-bottom:20px">
        <table style="width:100%;font-size:14px;font-family:sans-serif;border-collapse:collapse">
          <tr>
            <td style="color:#8a7e78;padding:8px 0;border-bottom:1px solid #f5f0eb">Stylist</td>
            <td style="font-weight:600;text-align:right;color:#1a1714;padding:8px 0;border-bottom:1px solid #f5f0eb">${stylistName}</td>
          </tr>
          <tr>
            <td style="color:#8a7e78;padding:8px 0;border-bottom:1px solid #f5f0eb">Service</td>
            <td style="font-weight:600;text-align:right;color:#1a1714;padding:8px 0;border-bottom:1px solid #f5f0eb">${serviceName}</td>
          </tr>
          <tr>
            <td style="color:#8a7e78;padding:8px 0">Date &amp; Time</td>
            <td style="font-weight:600;text-align:right;color:#1a1714;padding:8px 0">${dateTime}</td>
          </tr>
        </table>
      </div>
      <p style="text-align:center;font-size:13px;color:#8a7e78;font-family:sans-serif;margin:0 0 8px">
        Keri will review and confirm your appointment shortly. Need to cancel? Contact Keri directly.
      </p>
      <p style="text-align:center;margin-top:20px;font-size:12px;color:#8a7e78;font-family:sans-serif">Keri Choplin Hair Studio · Lafayette, Louisiana</p>
    </div>
  `;

  // Email to stylist — styled, actionable
  const stylistHtml = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#faf8f5">
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#f5ede8,#e8d8d0);display:inline-flex;align-items:center;justify-content:center;border:2px solid #e8e2dc;margin-bottom:12px">
          <span style="font-size:24px;color:#9b6f6f;font-weight:600">K</span>
        </div>
        <h2 style="margin:0;font-size:22px;color:#1a1714;font-family:Georgia,serif">New Booking Request</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#8a7e78;font-family:sans-serif">You have a new appointment request, Keri!</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e8e2dc;border-radius:16px;padding:20px;margin-bottom:20px">
        <table style="width:100%;font-size:14px;font-family:sans-serif;border-collapse:collapse">
          <tr>
            <td style="color:#8a7e78;padding:8px 0;border-bottom:1px solid #f5f0eb">Client</td>
            <td style="font-weight:600;text-align:right;color:#1a1714;padding:8px 0;border-bottom:1px solid #f5f0eb">${displayName}</td>
          </tr>
          <tr>
            <td style="color:#8a7e78;padding:8px 0;border-bottom:1px solid #f5f0eb">Service</td>
            <td style="font-weight:600;text-align:right;color:#1a1714;padding:8px 0;border-bottom:1px solid #f5f0eb">${serviceName}</td>
          </tr>
          <tr>
            <td style="color:#8a7e78;padding:8px 0">Date &amp; Time</td>
            <td style="font-weight:600;text-align:right;color:#1a1714;padding:8px 0">${dateTime}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center">
        <a href="https://tcgbooking.vercel.app/admin" style="display:inline-block;background:#9b6f6f;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:50px;font-family:sans-serif;font-size:14px;font-weight:600">
          Log in to approve →
        </a>
      </div>
      <p style="text-align:center;margin-top:20px;font-size:12px;color:#8a7e78;font-family:sans-serif">Keri Choplin Hair Studio · Lafayette, Louisiana</p>
    </div>
  `;

  await Promise.allSettled([
    sendEmail(clientEmail, `Your booking with ${stylistName} is confirmed`, clientHtml),
    sendEmail(stylistEmail, `New booking request from ${displayName} — ${serviceName}`, stylistHtml),
  ]);
}
