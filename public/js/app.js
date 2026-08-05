import { speak, stopSpeaking, startListening, isListeningSupported } from './speech.js';

const FOOD_OPTIONS = [
  { key: 'gluten', label: 'Bread / Wheat', icon: '🍞' },
  { key: 'dairy', label: 'Milk / Cheese', icon: '🧀' },
  { key: 'fruit', label: 'Fruit', icon: '🍎' },
  { key: 'veggie', label: 'Vegetables', icon: '🥦' },
  { key: 'protein', label: 'Meat / Eggs / Beans', icon: '🍗' },
  { key: 'grain_gf', label: 'Rice / GF Grain', icon: '🍚' },
  { key: 'sweet', label: 'Sweets / Dessert', icon: '🍬' },
  { key: 'fried', label: 'Fried / Greasy', icon: '🍟' },
  { key: 'drink', label: 'Drink', icon: '🥤' },
];

const SYMPTOM_OPTIONS = [
  { key: 'bloating', label: 'Bloated Belly', icon: '🎈' },
  { key: 'cramps', label: 'Cramps', icon: '⚡' },
  { key: 'nausea', label: 'Nausea', icon: '🤢' },
  { key: 'fatigue', label: 'Tired', icon: '😴' },
  { key: 'itchy', label: 'Itchy / Rash', icon: '🔴' },
  { key: 'headache', label: 'Headache', icon: '🤕' },
  { key: 'reflux', label: 'Heartburn', icon: '🔥' },
  { key: 'none', label: 'I Feel Fine', icon: '✅' },
];

const BRISTOL_OPTIONS = [
  { type: 1, label: 'Type 1: Hard little lumps', icon: '⚫⚫⚫' },
  { type: 2, label: 'Type 2: Lumpy, like a bumpy log', icon: '🟤〰️' },
  { type: 3, label: 'Type 3: Log shape with cracks', icon: '🟫' },
  { type: 4, label: 'Type 4: Smooth, soft log', icon: '🟠' },
  { type: 5, label: 'Type 5: Soft blobs', icon: '🟡🟡' },
  { type: 6, label: 'Type 6: Mushy, ragged pieces', icon: '💛' },
  { type: 7, label: 'Type 7: All liquid, no pieces', icon: '💦' },
];

const state = {
  selectedFoods: new Set(),
  selectedMood: null,
  selectedSymptoms: new Set(),
  selectedBristol: null,
  lastMealId: null,
};

function $(selector) {
  return document.querySelector(selector);
}

function navigate(screenName) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  const target = $(`#screen-${screenName}`);
  target.classList.add('active');
  const speakText = target.getAttribute('data-speak');
  if (speakText && localStorage.getItem('autoSpeak') !== 'off') {
    speak(speakText);
  }
  if (screenName === 'week') loadWeekSummary();
  if (screenName === 'home') checkPendingFeeling();
}

function buildOptionGrid(container, options, selectedSet, onToggle) {
  container.innerHTML = '';
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'option-button';
    btn.innerHTML = `<span class="pictograph">${opt.icon}</span><span>${opt.label}</span>`;
    btn.addEventListener('click', () => {
      if (selectedSet.has(opt.key)) {
        selectedSet.delete(opt.key);
        btn.classList.remove('selected');
      } else {
        selectedSet.add(opt.key);
        btn.classList.add('selected');
      }
      onToggle?.(opt);
    });
    container.appendChild(btn);
  });
}

function buildBristolList(container) {
  container.innerHTML = '';
  BRISTOL_OPTIONS.forEach((opt) => {
    const card = document.createElement('button');
    card.className = 'bristol-card';
    card.innerHTML = `<span style="font-size:32px;">${opt.icon}</span><span>${opt.label}</span>`;
    card.addEventListener('click', () => {
      container.querySelectorAll('.bristol-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedBristol = opt.type;
      speak(opt.label);
    });
    container.appendChild(card);
  });
}

async function postJSON(url, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    queueOffline(url, body);
    throw err;
  }
}

function queueOffline(url, body) {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  queue.push({ url, body, savedAt: new Date().toISOString() });
  localStorage.setItem('offlineQueue', JSON.stringify(queue));
}

async function flushOfflineQueue() {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  if (queue.length === 0) return;
  const remaining = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      remaining.push(item);
    }
  }
  localStorage.setItem('offlineQueue', JSON.stringify(remaining));
}

function showConfirmation(icon, text, nextScreen) {
  $('#confirmation-icon').textContent = icon;
  $('#confirmation-text').textContent = text;
  navigate('confirmation');
  speak(text);
  setTimeout(() => navigate(nextScreen), 1600);
}

function wireMicButtons() {
  document.querySelectorAll('.mic-button').forEach((btn) => {
    if (!isListeningSupported()) {
      btn.disabled = true;
      btn.title = 'Voice typing not supported in this browser';
      return;
    }
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-mic-target');
      const field = document.getElementById(targetId);
      btn.classList.add('listening');
      startListening({
        onResult: (transcript) => {
          field.value = field.value ? `${field.value} ${transcript}` : transcript;
        },
        onEnd: () => btn.classList.remove('listening'),
        onError: (msg) => {
          btn.classList.remove('listening');
          speak('Sorry, I could not hear that.');
          console.warn(msg);
        },
      });
    });
  });
}

function checkPendingFeeling() {
  fetch('/api/entries/recent-meals?limit=1')
    .then((r) => r.json())
    .then((meals) => {
      const slot = $('#pending-banner-slot');
      slot.innerHTML = '';
      if (!meals.length) return;
      const meal = meals[0];
      const minutesAgo = (Date.now() - new Date(meal.timestamp).getTime()) / 60000;
      if (minutesAgo >= 20 && minutesAgo <= 180) {
        state.lastMealId = meal.id;
        const banner = document.createElement('div');
        banner.className = 'pending-banner';
        banner.textContent = "You ate a bit ago — tap here to say how you're feeling";
        banner.addEventListener('click', () => navigate('feeling'));
        slot.appendChild(banner);
      }
    })
    .catch(() => {});
}

async function loadWeekSummary() {
  const el = $('#week-summary-content');
  el.innerHTML = '<p>Loading...</p>';
  try {
    const res = await fetch('/api/entries/summary/week');
    const { summary } = await res.json();
    el.innerHTML = `
      <p><strong>Meals logged:</strong> ${summary.meals.length}</p>
      <p><strong>Feeling check-ins:</strong> ${summary.feelings.length}</p>
      <p><strong>Bathroom trips logged:</strong> ${summary.stools.length}</p>
      <p><strong>Average mood:</strong> ${summary.avgMood ? summary.avgMood + ' / 5' : 'no data yet'}</p>
    `;
  } catch {
    el.innerHTML = '<p>Could not load this week\'s summary right now.</p>';
  }
}

function applyStoredPreferences() {
  if (localStorage.getItem('highContrast') === 'on') {
    document.body.classList.add('high-contrast');
  }
  const size = localStorage.getItem('fontSize');
  if (size) document.documentElement.style.setProperty('--font-size-base', `${size}px`);
}

function init() {
  applyStoredPreferences();

  buildOptionGrid($('#meal-options'), FOOD_OPTIONS, state.selectedFoods);
  buildOptionGrid($('#symptom-options'), SYMPTOM_OPTIONS, state.selectedSymptoms, (opt) => {
    if (opt.key === 'none') {
      state.selectedSymptoms.clear();
      state.selectedSymptoms.add('none');
      document.querySelectorAll('#symptom-options .option-button').forEach((btn, i) => {
        if (SYMPTOM_OPTIONS[i].key !== 'none') btn.classList.remove('selected');
      });
    }
  });
  buildBristolList($('#bristol-options'));
  wireMicButtons();

  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.getAttribute('data-nav')));
  });

  $('#btn-speak-screen').addEventListener('click', () => {
    const active = document.querySelector('.screen.active');
    const text = active?.getAttribute('data-speak');
    if (text) speak(text);
  });

  $('#mood-options').addEventListener('click', (e) => {
    const btn = e.target.closest('.mood-button');
    if (!btn) return;
    document.querySelectorAll('.mood-button').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.selectedMood = Number(btn.getAttribute('data-mood'));
  });

  $('#btn-save-meal').addEventListener('click', async () => {
    const notes = $('#meal-notes').value.trim();
    const entry = await postJSON('/api/entries/meal', {
      categories: Array.from(state.selectedFoods),
      notes,
    }).catch(() => null);
    state.lastMealId = entry?.id ?? null;
    state.selectedFoods.clear();
    document.querySelectorAll('#meal-options .option-button').forEach((b) => b.classList.remove('selected'));
    $('#meal-notes').value = '';
    showConfirmation('🍽️', 'Meal saved!', 'feeling');
  });

  $('#btn-save-feeling').addEventListener('click', async () => {
    const notes = $('#feeling-notes').value.trim();
    await postJSON('/api/entries/feeling', {
      mood: state.selectedMood,
      symptoms: Array.from(state.selectedSymptoms),
      notes,
      mealId: state.lastMealId,
    }).catch(() => null);
    state.selectedMood = null;
    state.selectedSymptoms.clear();
    document.querySelectorAll('#symptom-options .option-button, .mood-button').forEach((b) => b.classList.remove('selected'));
    $('#feeling-notes').value = '';
    showConfirmation('💚', 'Thanks for telling me!', 'home');
  });

  $('#btn-save-stool').addEventListener('click', async () => {
    if (!state.selectedBristol) {
      speak('Please pick a picture first.');
      return;
    }
    const notes = $('#stool-notes').value.trim();
    await postJSON('/api/entries/stool', {
      bristolType: state.selectedBristol,
      notes,
    }).catch(() => null);
    state.selectedBristol = null;
    document.querySelectorAll('.bristol-card').forEach((c) => c.classList.remove('selected'));
    $('#stool-notes').value = '';
    showConfirmation('💩', 'Logged, thank you!', 'home');
  });

  $('#btn-toggle-contrast').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast') ? 'on' : 'off');
  });

  $('#btn-text-bigger').addEventListener('click', () => adjustFontSize(2));
  $('#btn-text-smaller').addEventListener('click', () => adjustFontSize(-2));

  checkPendingFeeling();
  flushOfflineQueue();
  window.addEventListener('online', flushOfflineQueue);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }
}

function adjustFontSize(delta) {
  const current = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--font-size-base'),
    10
  ) || 22;
  const next = Math.min(32, Math.max(16, current + delta));
  document.documentElement.style.setProperty('--font-size-base', `${next}px`);
  localStorage.setItem('fontSize', String(next));
}

document.addEventListener('DOMContentLoaded', init);
