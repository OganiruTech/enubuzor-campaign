// backend/routes/admin.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';
import {
  sendRsvpConfirmation,
  sendRsvpAdminNotification,
} from '../services/email.js';

const router = express.Router();

// GET /api/admin/stats/dashboard
router.get('/stats/dashboard', verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [[eventStats]] = await connection.query(
      `SELECT COUNT(*) as total_events,
              COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_events
       FROM events`
    );
    const [[volunteerStats]] = await connection.query(
      'SELECT COUNT(*) as total_volunteers FROM volunteers'
    );
    const [[issueStats]] = await connection.query(
      `SELECT COUNT(*) as total_issues,
              COUNT(CASE WHEN status = 'reported' THEN 1 END) as open_issues
       FROM community_issues`
    );
    const [[donationStats]] = await connection.query(
      `SELECT COUNT(*) as total_donors,
              COALESCE(SUM(amount), 0) as total_raised
       FROM donations WHERE status = 'completed'`
    );

    connection.release();

    res.json({
      events: eventStats,
      volunteers: volunteerStats,
      issues: issueStats,
      donations: donationStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/rsvps/:eventId
router.get('/rsvps/:eventId', verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rsvps] = await connection.query(
      'SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at DESC',
      [req.params.eventId]
    );
    connection.release();
    res.json(rsvps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/rsvps — public (no auth required for RSVP)
router.post('/rsvps', async (req, res) => {
  try {
    const { event_id, name, phone, ward, guests, email } = req.body;

    if (!event_id || !name || !phone) {
      return res.status(400).json({ error: 'Event ID, name, and phone are required' });
    }

    const rsvpId = uuidv4();
    const connection = await pool.getConnection();

    await connection.query(
      `INSERT INTO rsvps (id, event_id, name, phone, ward, guests, status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [rsvpId, event_id, name, phone, ward || null, guests || 1]
    );

    await connection.query(
      'UPDATE events SET rsvp_count = rsvp_count + ? WHERE id = ?',
      [guests || 1, event_id]
    );

    // Fetch event details for email
    const [[event]] = await connection.query(
      'SELECT * FROM events WHERE id = ?', [event_id]
    );

    connection.release();

    // Fire-and-forget emails
    const rsvpData = { name, phone, ward, guests, email };
    sendRsvpConfirmation(rsvpData, event).catch(console.error);
    sendRsvpAdminNotification(rsvpData, event).catch(console.error);

    res.status(201).json({
      message: 'RSVP recorded successfully',
      id: rsvpId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users/all
router.get('/users/all', verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      `SELECT id, email, full_name, phone, ward, community, is_admin, created_at
       FROM users ORDER BY created_at DESC`
    );
    connection.release();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
  try {
    const { is_admin } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET is_admin = ? WHERE id = ?', [is_admin, req.params.id]
    );
    connection.release();
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;