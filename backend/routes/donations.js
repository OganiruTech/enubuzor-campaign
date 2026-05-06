// backend/routes/donations.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';
import {
  sendDonationConfirmation,
  sendDonationAdminNotification,
} from '../services/email.js';

const router = express.Router();

// GET /api/donations — admin only
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [donations] = await connection.query(
      'SELECT * FROM donations ORDER BY created_at DESC'
    );
    connection.release();
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/donations/stats/summary — admin only
router.get('/stats/summary', verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [stats] = await connection.query(
      `SELECT
        COUNT(*) as total_donations,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as average_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_donations
       FROM donations`
    );
    connection.release();
    res.json(stats[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/donations — public
router.post('/', async (req, res) => {
  try {
    const { donor_name, email, phone, amount, payment_method, message, is_anonymous } = req.body;

    if (!donor_name || !amount) {
      return res.status(400).json({ error: 'Donor name and amount are required' });
    }

    const donationId = uuidv4();
    const connection = await pool.getConnection();

    await connection.query(
      `INSERT INTO donations
         (id, donor_name, email, phone, amount, payment_method, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [donationId, donor_name, email || null, phone || null,
       amount, payment_method || 'bank_transfer', message || null]
    );
    connection.release();

    // Fire-and-forget emails
    const donationData = { donor_name, email, phone, amount, payment_method, message, is_anonymous };
    sendDonationConfirmation(donationData).catch(console.error);
    sendDonationAdminNotification(donationData).catch(console.error);

    res.status(201).json({
      message: 'Donation received successfully',
      id: donationId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/donations/:id — admin only
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE donations SET status = ? WHERE id = ?', [status, req.params.id]
    );
    connection.release();
    res.json({ message: 'Donation updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;