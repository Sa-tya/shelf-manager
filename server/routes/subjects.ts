import express from 'express';
import { query } from '../config/db';

const router = express.Router();

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await query('SELECT * FROM subjects ORDER BY id DESC');
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Create a new subject
router.post('/', async (req, res) => {
  try {
    const { subid, name } = req.body;

    if (!subid || !name) {
      return res.status(400).json({ error: 'Subject ID and name are required' });
    }

    const result = await query(
      'INSERT INTO subjects (subid, name) VALUES (?, ?)',
      [subid, name]
    );

    const newSubject = {
      id: (result as any).insertId,
      subid,
      name,
    };

    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

export default router; 