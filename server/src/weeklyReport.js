import { getEntriesInRange } from './db.js';
import { sendEmail } from './email.js';
import { config } from './config.js';

const BRISTOL_LABELS = {
  1: 'Type 1 - separate hard lumps (very constipated)',
  2: 'Type 2 - lumpy sausage shape (mildly constipated)',
  3: 'Type 3 - sausage shape with cracks (normal)',
  4: 'Type 4 - smooth soft sausage (normal)',
  5: 'Type 5 - soft blobs with clear edges (lacking fiber)',
  6: 'Type 6 - mushy, ragged edges (mild diarrhea)',
  7: 'Type 7 - liquid, no solid pieces (diarrhea)',
};

const MOOD_LABELS = { 1: 'very bad', 2: 'not great', 3: 'okay', 4: 'good', 5: 'very good' };

function startOfWeekRange(now = new Date()) {
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function summarize(entries) {
  const meals = entries.filter((e) => e.type === 'meal');
  const feelings = entries.filter((e) => e.type === 'feeling');
  const stools = entries.filter((e) => e.type === 'stool');

  const foodCategoryCounts = {};
  for (const meal of meals) {
    for (const cat of meal.data.categories || []) {
      foodCategoryCounts[cat] = (foodCategoryCounts[cat] || 0) + 1;
    }
  }

  const symptomCounts = {};
  let moodTotal = 0;
  let moodCount = 0;
  for (const f of feelings) {
    if (f.data.mood) {
      moodTotal += f.data.mood;
      moodCount += 1;
    }
    for (const s of f.data.symptoms || []) {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    }
  }

  const bristolCounts = {};
  for (const s of stools) {
    const t = s.data.bristolType;
    if (t) bristolCounts[t] = (bristolCounts[t] || 0) + 1;
  }

  return {
    meals,
    feelings,
    stools,
    foodCategoryCounts,
    symptomCounts,
    bristolCounts,
    avgMood: moodCount ? (moodTotal / moodCount).toFixed(1) : null,
  };
}

function renderHtml(summary, { childName, startISO, endISO }) {
  const dateRange = `${new Date(startISO).toLocaleDateString()} - ${new Date(endISO).toLocaleDateString()}`;

  const foodRows = Object.entries(summary.foodCategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `<tr><td>${cat}</td><td>${count}</td></tr>`)
    .join('') || '<tr><td colspan="2">No meals logged this week</td></tr>';

  const symptomRows = Object.entries(summary.symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([sym, count]) => `<tr><td>${sym}</td><td>${count}</td></tr>`)
    .join('') || '<tr><td colspan="2">No symptoms logged this week</td></tr>';

  const bristolRows = Object.entries(summary.bristolCounts)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([type, count]) => `<tr><td>${BRISTOL_LABELS[type] || `Type ${type}`}</td><td>${count}</td></tr>`)
    .join('') || '<tr><td colspan="2">No bathroom entries logged this week</td></tr>';

  const feelingList = summary.feelings
    .map((f) => {
      const time = new Date(f.timestamp).toLocaleString();
      const mood = f.data.mood ? MOOD_LABELS[f.data.mood] || f.data.mood : 'n/a';
      const symptoms = (f.data.symptoms || []).join(', ') || 'none noted';
      const notes = f.data.notes ? ` - "${f.data.notes}"` : '';
      return `<li>${time}: feeling ${mood}, symptoms: ${symptoms}${notes}</li>`;
    })
    .join('') || '<li>No feeling check-ins logged this week</li>';

  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #222;">
      <h2>Weekly update for ${childName}</h2>
      <p style="color:#555;">${dateRange}</p>

      <p>This is an automated summary of self-reported entries from the tracking app.
      It's meant to support conversations with her care team, not to serve as a diagnosis.</p>

      <h3>Meals logged: ${summary.meals.length}</h3>
      <table cellpadding="6" style="border-collapse: collapse; width: 100%;" border="1">
        <tr><th align="left">Food category</th><th align="left">Times eaten</th></tr>
        ${foodRows}
      </table>

      <h3>How she's been feeling</h3>
      <p>Average mood this week: ${summary.avgMood !== null ? summary.avgMood + ' / 5' : 'no check-ins logged'}</p>
      <table cellpadding="6" style="border-collapse: collapse; width: 100%;" border="1">
        <tr><th align="left">Symptom</th><th align="left">Times reported</th></tr>
        ${symptomRows}
      </table>
      <ul>${feelingList}</ul>

      <h3>Bathroom log (Bristol Stool Chart)</h3>
      <table cellpadding="6" style="border-collapse: collapse; width: 100%;" border="1">
        <tr><th align="left">Type</th><th align="left">Times logged</th></tr>
        ${bristolRows}
      </table>

      <p style="color:#888; font-size: 12px; margin-top: 24px;">
        Sent automatically by the Annapurna tracking app.
      </p>
    </div>
  `;
}

export async function buildWeeklySummary(now = new Date()) {
  const { startISO, endISO } = startOfWeekRange(now);
  const entries = getEntriesInRange(startISO, endISO);
  const summary = summarize(entries);
  return { summary, startISO, endISO };
}

export async function sendWeeklyReport(now = new Date()) {
  if (config.parentEmails.length === 0) {
    console.warn('PARENT_EMAILS is not set yet - skipping weekly report send.');
    return { skipped: true, reason: 'no recipients configured' };
  }

  const { summary, startISO, endISO } = await buildWeeklySummary(now);
  const html = renderHtml(summary, { childName: config.childName, startISO, endISO });
  const text = `Weekly update for ${config.childName}. Open in an HTML-capable mail client to see the full summary.`;

  return sendEmail({
    to: config.parentEmails,
    subject: `Weekly food & symptom update for ${config.childName}`,
    html,
    text,
  });
}
