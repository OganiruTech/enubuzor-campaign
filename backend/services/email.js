// backend/services/email.js
//
// Dev:  Uses Ethereal (https://ethereal.email) — fake SMTP, no real emails sent.
//       Preview URLs are logged to the console so you can inspect every email.
//
// Prod: Uses your real SMTP credentials from .env

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const IS_PROD = process.env.NODE_ENV === 'production';

// ── Build transporter ─────────────────────────────────────────────────────────
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (IS_PROD) {
    // Production: use real SMTP from .env
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log('✅ Production email transport ready');
    } catch (err) {
      console.warn('⚠️  Production SMTP error:', err.message);
    }
  } else {
    // Development: use Ethereal fake SMTP
    // Creates a fresh test account automatically — no config needed
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Dev email transport ready (Ethereal)');
    console.log(`   User: ${testAccount.user}`);
    console.log('   Preview emails at https://ethereal.email/messages');
  }

  return transporter;
};

// ── FROM address ──────────────────────────────────────────────────────────────
const getFrom = () =>
  IS_PROD
    ? process.env.EMAIL_FROM || 'NDC Campaign <no-reply@enubuzor.org>'
    : '"NDC Campaign [DEV]" <dev@enubuzor.org>';

const ADMIN = process.env.ADMIN_EMAIL;

// ── HTML wrapper ──────────────────────────────────────────────────────────────
const wrap = (body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f0f2f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #2d3a8c; padding: 28px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; color: #1a2040; font-size: 15px; line-height: 1.6; }
    .field { margin: 10px 0; }
    .field strong { display: inline-block; min-width: 140px; color: #4a5568; font-size: 13px; }
    .value { color: #1a2040; }
    .badge { display: inline-block; background: #e01e1e; color: #fff; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; letter-spacing: 0.5px; }
    .footer { background: #eef0f8; padding: 16px 32px; font-size: 12px; color: #718096; text-align: center; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    .cta { display: inline-block; background: #2d3a8c; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NDC Campaign — Ogbuefi Nicholas Enubuzor</h1>
      <p>Ukwuani/Ndokwa West Constituency · Service to the People</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">© 2026 Ogbuefi Nicholas Enubuzor Campaign. All rights reserved. · <a href="https://enubuzor.org" style="color:#2d3a8c;">enubuzor.org</a></div>
  </div>
</body>
</html>`;

// ── Core send helper ──────────────────────────────────────────────────────────
const send = async (to, subject, html) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({ from: getFrom(), to, subject, html });

    if (!IS_PROD) {
      // Log the Ethereal preview URL in development
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n📧 Email sent [DEV]`);
      console.log(`   To:      ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Preview: ${previewUrl}\n`);
    } else {
      console.log(`📧 Email sent → ${to} [${subject}]`);
    }
  } catch (err) {
    console.error(`❌ Email error [${subject}] → ${to}:`, err.message);
  }
};

// ── Broadcast helper (send to all users) ─────────────────────────────────────
// Used when admin publishes media/events — imported by routes that need it
export const sendBroadcast = async (pool, subject, html) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      "SELECT email FROM users WHERE email IS NOT NULL AND email != ''"
    );
    connection.release();

    if (users.length === 0) return;

    console.log(`📢 Broadcasting to ${users.length} users: ${subject}`);
    // Send in small batches to avoid overwhelming SMTP
    const BATCH = 20;
    for (let i = 0; i < users.length; i += BATCH) {
      const batch = users.slice(i, i + BATCH);
      await Promise.allSettled(batch.map(u => send(u.email, subject, html)));
    }
  } catch (err) {
    console.error('Broadcast error:', err.message);
  }
};

// ── Volunteer emails ──────────────────────────────────────────────────────────
export const sendVolunteerConfirmation = async (volunteer) => {
  if (!volunteer.email) return;
  const html = wrap(`
    <div class="badge">Welcome to the Team!</div>
    <p>Dear <strong>${volunteer.full_name}</strong>,</p>
    <p>Thank you for signing up to volunteer for the Ogbuefi Nicholas Enubuzor NDC campaign. Your support means everything to us.</p>
    <hr />
    <div class="field"><strong>Your Role:</strong> <span class="value">${(volunteer.role_type || 'Volunteer').replace(/_/g, ' ')}</span></div>
    <div class="field"><strong>Ward:</strong> <span class="value">${volunteer.ward || 'N/A'}</span></div>
    <div class="field"><strong>Community:</strong> <span class="value">${volunteer.community || 'N/A'}</span></div>
    <hr />
    <p>A campaign coordinator will contact you at <strong>${volunteer.phone}</strong> shortly.</p>
    <p>Together, we will deliver <em>Service to the People</em> for Ukwuani/Ndokwa West!</p>
    <a href="https://enubuzor.org/events" class="cta">View Upcoming Events</a>
  `);
  await send(volunteer.email, '🎉 Welcome to the NDC Campaign Team!', html);
};

export const sendVolunteerAdminNotification = async (volunteer) => {
  if (!ADMIN) return;
  const html = wrap(`
    <div class="badge">New Volunteer</div>
    <p>A new volunteer has registered on the campaign platform.</p>
    <hr />
    <div class="field"><strong>Name:</strong> <span class="value">${volunteer.full_name}</span></div>
    <div class="field"><strong>Phone:</strong> <span class="value">${volunteer.phone}</span></div>
    <div class="field"><strong>Email:</strong> <span class="value">${volunteer.email || 'N/A'}</span></div>
    <div class="field"><strong>Role:</strong> <span class="value">${(volunteer.role_type || '').replace(/_/g, ' ')}</span></div>
    <div class="field"><strong>Ward:</strong> <span class="value">${volunteer.ward || 'N/A'}</span></div>
    <div class="field"><strong>Community:</strong> <span class="value">${volunteer.community || 'N/A'}</span></div>
    <div class="field"><strong>Occupation:</strong> <span class="value">${volunteer.occupation || 'N/A'}</span></div>
    <div class="field"><strong>Age Group:</strong> <span class="value">${volunteer.age_group || 'N/A'}</span></div>
    ${volunteer.skills ? `<div class="field"><strong>Skills:</strong> <span class="value">${volunteer.skills}</span></div>` : ''}
  `);
  await send(ADMIN, `New Volunteer: ${volunteer.full_name} (${volunteer.ward || 'Unknown Ward'})`, html);
};

// ── RSVP emails ───────────────────────────────────────────────────────────────
export const sendRsvpConfirmation = async (rsvp, event) => {
  if (!rsvp.email) return;
  const html = wrap(`
    <div class="badge">RSVP Confirmed!</div>
    <p>Dear <strong>${rsvp.name}</strong>,</p>
    <p>Your RSVP for the following NDC campaign event has been confirmed:</p>
    <hr />
    <div class="field"><strong>Event:</strong> <span class="value">${event?.title || 'Campaign Event'}</span></div>
    <div class="field"><strong>Date:</strong> <span class="value">${event?.date || 'TBD'}</span></div>
    <div class="field"><strong>Time:</strong> <span class="value">${event?.time || 'TBD'}</span></div>
    <div class="field"><strong>Location:</strong> <span class="value">${event?.location || 'TBD'}</span></div>
    <div class="field"><strong>Guests:</strong> <span class="value">${rsvp.guests || 1}</span></div>
    <hr />
    <p>Please arrive a few minutes early. We look forward to seeing you there!</p>
  `);
  await send(rsvp.email, `✅ RSVP Confirmed: ${event?.title || 'Campaign Event'}`, html);
};

export const sendRsvpAdminNotification = async (rsvp, event) => {
  if (!ADMIN) return;
  const html = wrap(`
    <div class="badge">New RSVP</div>
    <hr />
    <div class="field"><strong>Event:</strong> <span class="value">${event?.title || 'N/A'}</span></div>
    <div class="field"><strong>Name:</strong> <span class="value">${rsvp.name}</span></div>
    <div class="field"><strong>Phone:</strong> <span class="value">${rsvp.phone}</span></div>
    <div class="field"><strong>Ward:</strong> <span class="value">${rsvp.ward || 'N/A'}</span></div>
    <div class="field"><strong>Guests:</strong> <span class="value">${rsvp.guests || 1}</span></div>
  `);
  await send(ADMIN, `New RSVP: ${rsvp.name} → ${event?.title || 'Event'}`, html);
};

// ── Donation emails ───────────────────────────────────────────────────────────
export const sendDonationConfirmation = async (donation) => {
  if (!donation.email) return;
  const html = wrap(`
    <div class="badge">Thank You!</div>
    <p>Dear <strong>${donation.is_anonymous ? 'Valued Supporter' : donation.donor_name}</strong>,</p>
    <p>We have received your donation and are deeply grateful for your support.</p>
    <hr />
    <div class="field"><strong>Amount:</strong> <span class="value">₦${Number(donation.amount).toLocaleString()}</span></div>
    <div class="field"><strong>Method:</strong> <span class="value">${(donation.payment_method || '').replace(/_/g, ' ')}</span></div>
    ${donation.message ? `<div class="field"><strong>Message:</strong> <span class="value">${donation.message}</span></div>` : ''}
    <hr />
    <p>Please complete your bank transfer to:</p>
    <div class="field"><strong>Bank:</strong> <span class="value">[Campaign Bank Name]</span></div>
    <div class="field"><strong>Account:</strong> <span class="value">[Account Number]</span></div>
    <div class="field"><strong>Name:</strong> <span class="value">NDC Campaign - Enubuzor</span></div>
  `);
  await send(donation.email, '💙 Thank You for Supporting Our Campaign!', html);
};

export const sendDonationAdminNotification = async (donation) => {
  if (!ADMIN) return;
  const html = wrap(`
    <div class="badge">New Donation</div>
    <hr />
    <div class="field"><strong>Donor:</strong> <span class="value">${donation.is_anonymous ? 'Anonymous' : donation.donor_name}</span></div>
    <div class="field"><strong>Amount:</strong> <span class="value">₦${Number(donation.amount).toLocaleString()}</span></div>
    <div class="field"><strong>Phone:</strong> <span class="value">${donation.phone || 'N/A'}</span></div>
    <div class="field"><strong>Email:</strong> <span class="value">${donation.email || 'N/A'}</span></div>
    <div class="field"><strong>Method:</strong> <span class="value">${(donation.payment_method || '').replace(/_/g, ' ')}</span></div>
    ${donation.message ? `<div class="field"><strong>Message:</strong> <span class="value">${donation.message}</span></div>` : ''}
  `);
  await send(ADMIN, `💰 New Donation: ₦${Number(donation.amount).toLocaleString()} from ${donation.is_anonymous ? 'Anonymous' : donation.donor_name}`, html);
};

// ── Issue emails ──────────────────────────────────────────────────────────────
export const sendIssueConfirmation = async (issue) => {
  if (!issue.reporter_email) return;
  const html = wrap(`
    <div class="badge">Issue Received</div>
    <p>Dear <strong>${issue.reporter_name || 'Community Member'}</strong>,</p>
    <p>Thank you for reporting a community issue. We will champion your cause.</p>
    <hr />
    <div class="field"><strong>Issue:</strong> <span class="value">${issue.title}</span></div>
    <div class="field"><strong>Category:</strong> <span class="value">${(issue.category || '').replace(/_/g, ' ')}</span></div>
    <div class="field"><strong>Community:</strong> <span class="value">${issue.community || 'N/A'}</span></div>
    <div class="field"><strong>Ward:</strong> <span class="value">${issue.ward || 'N/A'}</span></div>
    <hr />
    <p>We will review your report and provide an update. Your voice matters.</p>
    <a href="https://enubuzor.org/issues" class="cta">View All Issues</a>
  `);
  await send(issue.reporter_email, '📋 Your Community Issue Has Been Received', html);
};

export const sendIssueAdminNotification = async (issue) => {
  if (!ADMIN) return;
  const html = wrap(`
    <div class="badge">New Issue</div>
    <hr />
    <div class="field"><strong>Title:</strong> <span class="value">${issue.title}</span></div>
    <div class="field"><strong>Category:</strong> <span class="value">${(issue.category || '').replace(/_/g, ' ')}</span></div>
    <div class="field"><strong>Community:</strong> <span class="value">${issue.community || 'N/A'}</span></div>
    <div class="field"><strong>Ward:</strong> <span class="value">${issue.ward || 'N/A'}</span></div>
    <div class="field"><strong>Reporter:</strong> <span class="value">${issue.reporter_name || 'Anonymous'}</span></div>
    <div class="field"><strong>Phone:</strong> <span class="value">${issue.reporter_phone || 'N/A'}</span></div>
    ${issue.description ? `<div class="field"><strong>Description:</strong> <span class="value">${issue.description}</span></div>` : ''}
  `);
  await send(ADMIN, `🚨 New Issue: ${issue.title}`, html);
};

// ── Broadcast: new media post ─────────────────────────────────────────────────
export const sendNewMediaBroadcast = async (pool, post) => {
  const html = wrap(`
    <div class="badge">New Update</div>
    <p>The NDC campaign has published a new update:</p>
    <hr />
    <div class="field"><strong>Title:</strong> <span class="value">${post.title}</span></div>
    <div class="field"><strong>Type:</strong> <span class="value">${(post.media_type || '').replace(/_/g, ' ')}</span></div>
    ${post.content ? `<p style="margin-top:12px">${post.content}</p>` : ''}
    <hr />
    <a href="https://enubuzor.org/media" class="cta">Read More</a>
  `);
  await sendBroadcast(pool, `📢 NDC Campaign Update: ${post.title}`, html);
};

// ── Broadcast: new event ──────────────────────────────────────────────────────
export const sendNewEventBroadcast = async (pool, event) => {
  const html = wrap(`
    <div class="badge">New Event</div>
    <p>A new NDC campaign event has been announced!</p>
    <hr />
    <div class="field"><strong>Event:</strong> <span class="value">${event.title}</span></div>
    <div class="field"><strong>Date:</strong> <span class="value">${event.date || 'TBD'}</span></div>
    <div class="field"><strong>Time:</strong> <span class="value">${event.time || 'TBD'}</span></div>
    <div class="field"><strong>Location:</strong> <span class="value">${event.location || 'TBD'}</span></div>
    ${event.description ? `<p style="margin-top:12px">${event.description}</p>` : ''}
    <hr />
    <a href="https://enubuzor.org/events" class="cta">RSVP Now</a>
  `);
  await sendBroadcast(pool, `📅 New Event: ${event.title}`, html);
};