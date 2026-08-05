import { Router } from 'express';
import { insertEntry, getEntriesInRange, getRecentMeals } from '../db.js';
import { buildWeeklySummary } from '../weeklyReport.js';

const router = Router();

function nowISO() {
  return new Date().toISOString();
}

router.post('/meal', (req, res) => {
  const { categories = [], notes = '', timestamp } = req.body || {};
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'categories must be an array' });
  }
  const entry = insertEntry('meal', timestamp || nowISO(), { categories, notes });
  res.status(201).json(entry);
});

router.post('/feeling', (req, res) => {
  const { mood, symptoms = [], notes = '', mealId = null, timestamp } = req.body || {};
  if (mood !== undefined && (mood < 1 || mood > 5)) {
    return res.status(400).json({ error: 'mood must be between 1 and 5' });
  }
  const entry = insertEntry('feeling', timestamp || nowISO(), { mood, symptoms, notes, mealId });
  res.status(201).json(entry);
});

router.post('/stool', (req, res) => {
  const { bristolType, notes = '', timestamp } = req.body || {};
  if (!bristolType || bristolType < 1 || bristolType > 7) {
    return res.status(400).json({ error: 'bristolType must be between 1 and 7' });
  }
  const entry = insertEntry('stool', timestamp || nowISO(), { bristolType, notes });
  res.status(201).json(entry);
});

router.get('/recent-meals', (req, res) => {
  const limit = Number(req.query.limit) || 5;
  res.json(getRecentMeals(limit));
});

router.get('/', (req, res) => {
  const { start, end, type } = req.query;
  const endISO = end || new Date().toISOString();
  const startISO = start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  res.json(getEntriesInRange(startISO, endISO, type));
});

router.get('/summary/week', async (req, res) => {
  const { summary, startISO, endISO } = await buildWeeklySummary();
  res.json({ summary, startISO, endISO });
});

export default router;
