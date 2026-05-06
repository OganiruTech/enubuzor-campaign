// backend/routes/events.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';
import { sendNewEventBroadcast } from '../services/email.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [events] = await connection.query(
      "SELECT * FROM events WHERE status = 'upcoming' OR status = 'active' ORDER BY date ASC"
    );
    connection.release();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [events] = await connection.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    connection.release();
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(events[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { title, description, event_type, date, time, location, ward } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const eventId = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO events (id, title, description, event_type, date, time, location, ward, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')`,
      [eventId, title, description, event_type, date, time, location, ward]
    );
    connection.release();

    // Broadcast to all registered users (fire-and-forget)
    sendNewEventBroadcast(pool, { title, description, date, time, location }).catch(console.error);

    res.status(201).json({ message: 'Event created successfully', id: eventId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, description, event_type, date, time, location, ward, status } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE events SET title=?, description=?, event_type=?, date=?, time=?, location=?, ward=?, status=? WHERE id=?`,
      [title, description, event_type, date, time, location, ward, status, req.params.id]
    );
    connection.release();
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;