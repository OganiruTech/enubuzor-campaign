// backend/routes/media.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { verifyAdmin } from '../middleware/auth.js';
import { sendNewMediaBroadcast } from '../services/email.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { media_type, category } = req.query;
    let query = "SELECT * FROM media_posts WHERE status = 'published'";
    const params = [];
    if (media_type) { query += ' AND media_type = ?'; params.push(media_type); }
    if (category)   { query += ' AND category = ?';   params.push(category); }
    query += ' ORDER BY is_featured DESC, created_at DESC';
    const connection = await pool.getConnection();
    const [posts] = await connection.query(query, params);
    connection.release();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [posts] = await connection.query('SELECT * FROM media_posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) { connection.release(); return res.status(404).json({ error: 'Post not found' }); }
    await connection.query('UPDATE media_posts SET views = views + 1 WHERE id = ?', [req.params.id]);
    connection.release();
    res.json(posts[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { title, description, content, media_type, media_url, thumbnail_url, category, tags, is_featured } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const postId = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO media_posts
         (id, title, description, content, media_type, media_url, thumbnail_url, category, tags, is_featured, status, views, likes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, 0)`,
      [postId, title, description || null, content || null, media_type || 'announcement',
       media_url || null, thumbnail_url || null, category || null,
       JSON.stringify(tags || []), is_featured ? 1 : 0]
    );
    connection.release();

    // Broadcast to all registered users (fire-and-forget)
    sendNewMediaBroadcast(pool, { title, content, media_type }).catch(console.error);

    res.status(201).json({ message: 'Media post created successfully', id: postId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('UPDATE media_posts SET likes = likes + 1 WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Post liked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, description, content, status, category, is_featured } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE media_posts SET title=?, description=?, content=?, status=?, category=?, is_featured=? WHERE id=?`,
      [title, description || null, content || null, status, category || null, is_featured ? 1 : 0, req.params.id]
    );
    connection.release();
    res.json({ message: 'Media post updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM media_posts WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Media post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;