// backend/routes/issues.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';
import {
  sendIssueConfirmation,
  sendIssueAdminNotification,
} from '../services/email.js';

const router = express.Router();

// GET /api/issues — public with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, ward, status } = req.query;
    let query = 'SELECT * FROM community_issues WHERE 1=1';
    const params = [];

    if (category) { query += ' AND category = ?'; params.push(category); }
    if (ward)     { query += ' AND ward = ?';     params.push(ward); }
    if (status)   { query += ' AND status = ?';   params.push(status); }

    query += ' ORDER BY upvotes DESC, created_at DESC';

    const connection = await pool.getConnection();
    const [issues] = await connection.query(query, params);
    connection.release();
    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/issues/:id
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [issues] = await connection.query(
      'SELECT * FROM community_issues WHERE id = ?', [req.params.id]
    );
    connection.release();

    if (issues.length === 0) return res.status(404).json({ error: 'Issue not found' });
    res.json(issues[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues — public
router.post('/', async (req, res) => {
  try {
    const {
      title, description, category, location,
      ward, community, reporter_name, reporter_phone, reporter_email,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const issueId = uuidv4();
    const connection = await pool.getConnection();

    await connection.query(
      `INSERT INTO community_issues
         (id, title, description, category, location, ward, community,
          reporter_name, reporter_phone, status, upvotes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'reported', 0)`,
      [issueId, title, description || null, category, location || null,
       ward || null, community || null, reporter_name || null, reporter_phone || null]
    );
    connection.release();

    // Fire-and-forget emails
    const issueData = {
      title, description, category, community, ward,
      reporter_name, reporter_phone, reporter_email,
    };
    sendIssueConfirmation(issueData).catch(console.error);
    sendIssueAdminNotification(issueData).catch(console.error);

    res.status(201).json({
      message: 'Issue reported successfully',
      id: issueId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues/:id/upvote — public
router.post('/:id/upvote', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE community_issues SET upvotes = upvotes + 1 WHERE id = ?', [req.params.id]
    );
    connection.release();
    res.json({ message: 'Issue upvoted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:id — admin only (status update)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { status, upvotes } = req.body;
    const connection = await pool.getConnection();

    if (upvotes !== undefined) {
      // Allow direct upvote count update (used by admin or fallback)
      await connection.query(
        'UPDATE community_issues SET upvotes = ? WHERE id = ?', [upvotes, req.params.id]
      );
    } else {
      await connection.query(
        'UPDATE community_issues SET status = ? WHERE id = ?', [status, req.params.id]
      );
    }

    connection.release();
    res.json({ message: 'Issue updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;