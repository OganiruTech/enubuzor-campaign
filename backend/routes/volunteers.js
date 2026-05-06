// backend/routes/volunteers.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import {
  sendVolunteerConfirmation,
  sendVolunteerAdminNotification,
} from '../services/email.js';

const router = express.Router();

// GET /api/volunteers — admin only
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status, ward } = req.query;
    let query = 'SELECT * FROM volunteers WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (ward)   { query += ' AND ward = ?';   params.push(ward); }

    query += ' ORDER BY created_at DESC';

    const connection = await pool.getConnection();
    const [volunteers] = await connection.query(query, params);
    connection.release();

    res.json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/volunteers — public signup
router.post('/', async (req, res) => {
  try {
    const {
      full_name, phone, email, occupation,
      ward, community, age_group, role_type, skills,
    } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({ error: 'Full name and phone are required' });
    }

    const volunteerId = uuidv4();
    // user_id is nullable in most campaign setups — use NULL unless authenticated
    const userId = req.user?.id || null;

    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO volunteers
         (id, user_id, full_name, phone, email, occupation, ward, community, age_group, role_type, skills, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [volunteerId, userId, full_name, phone, email || null, occupation || null,
       ward || null, community || null, age_group || null,
       role_type || 'volunteer', skills || null]
    );
    connection.release();

    // Fire-and-forget emails
    const volunteerData = { full_name, phone, email, ward, community, occupation, age_group, role_type, skills };
    sendVolunteerConfirmation(volunteerData).catch(console.error);
    sendVolunteerAdminNotification(volunteerData).catch(console.error);

    res.status(201).json({
      message: 'Volunteer signup successful',
      id: volunteerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/volunteers/:id
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [volunteers] = await connection.query(
      'SELECT * FROM volunteers WHERE id = ?', [req.params.id]
    );
    connection.release();

    if (volunteers.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.json(volunteers[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/volunteers/:id — admin only
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { status, role_type } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE volunteers SET status = ?, role_type = ? WHERE id = ?',
      [status, role_type, req.params.id]
    );
    connection.release();
    res.json({ message: 'Volunteer updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;