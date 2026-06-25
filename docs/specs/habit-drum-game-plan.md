# Habit Drum Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained, single-page personal habit tracker + daily drum-workout web app that persists to localStorage, with file backup, hosted on GitHub Pages.

**Architecture:** Static files, no build, no runtime dependencies. Pure, DOM-free logic lives in `logic.js` (unit-tested in Node with `node:test`). The curriculum data lives in `workout-curriculum.js`. `index.html` holds all CSS, DOM rendering, the Web Audio metronome, the practice timer, and confetti, and consumes `logic.js` via browser globals.

**Tech Stack:** Vanilla JavaScript (ES2019), HTML, CSS, Web Audio API, `node:test` for tests. Google Fonts (Fredoka, Nunito) with system fallback.

## Global Constraints

- No runtime dependencies; no build step. The app must run by opening `index.html`.
- No network calls except Google Fonts CSS (degrade gracefully to system fonts).
- `logic.js` must contain **no** DOM or `localStorage` access — pure functions only, exported via both `window` (browser) and `module.exports` (Node).
- Single localStorage key: `jasonDaily.v1`. Date keys are local-time `YYYY-MM-DD`.
- Default needs, in order: Devotion, Eat breakfast, Take a bath, Eat lunch, Hatid luvie, Sundo luvie, Today's drum workout (the `link:"drum"` item).
- Default settings: `tempoIncrement: 2`, `bonusPerWant: 10`, `metronomeBpm: 80`.
- Palette: background `#EFE5D4`/gradient `#FBF6EE→#F2E8D8`; primary coral→gold `#F2A07B→#F6C56B`; done/bonus green `#6FBF93→#9FD3B4`; text `#4B4139`. Fonts: Fredoka (headings), Nunito (body).
- Mobile breakpoint ~720px; all controls touch-sized.
- Commit after every task. Branch: `feature/habit-drum-game`. Update `CHANGELOG.md` each task.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `logic.js` | Pure functions: dates, seed, reads, state transitions, serialize/migrate. |
| `workout-curriculum.js` | `CURRICULUM` array (6 stages of exercises). |
| `index.html` | CSS, DOM render, router, metronome, timer, confetti, storage glue. |
| `test/logic.test.js` | `node:test` unit tests for `logic.js`. |
| `package.json` | `"test": "node --test"` script; no dependencies. |
| `README.md` | Run/host/edit-curriculum/backup docs. |
| `CHANGELOG.md` | Keep a Changelog + SemVer. |

---

## Task 1: Scaffolding, package.json, curriculum data

**Files:**
- Create: `package.json`
- Create: `workout-curriculum.js`
- Create: `test/curriculum.test.js`

**Interfaces:**
- Produces: global/`module.exports` `CURRICULUM` — array of stages
  `{ id, title, desc, goal, daysToAdvance, exercises: Exercise[] }` where
  `Exercise = { id, name, instructions, startBpm?, maxBpm?, durationMin?, reps?, demoUrl? }`.
  Every exercise `id` is unique across the whole curriculum.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "jason-daily",
  "version": "0.1.0",
  "private": true,
  "description": "Self-contained habit tracker + daily drum workout",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create `workout-curriculum.js`** (full default curriculum; replaceable later)

```javascript
// workout-curriculum.js
// Drop-in curriculum. Each stage's `exercises` become the daily workout while
// that stage is current. `daysToAdvance` = completed days needed to advance.
// Exercise ids must be globally unique. demoUrl is optional (a YouTube link).
(function (root) {
  const CURRICULUM = [
    {
      id: 's1', title: 'Foundations',
      desc: 'Grip, posture, and clean single strokes.',
      goal: 'Even single strokes at 60 BPM', daysToAdvance: 5,
      exercises: [
        { id: 's1-grip', name: 'Grip & posture check', instructions: 'Matched grip, relaxed shoulders, sticks rebound off the pad. No metronome — just feel the bounce.', durationMin: 2 },
        { id: 's1-singles', name: 'Single strokes (R L R L)', instructions: 'One hit per hand, alternating, evenly spaced to the click.', startBpm: 60, maxBpm: 100, durationMin: 3 },
        { id: 's1-accents', name: 'Quarter-note accents', instructions: 'Single strokes, accent beat 1 of each group of 4. Keep unaccented strokes soft.', startBpm: 60, maxBpm: 90, durationMin: 2 },
        { id: 's1-cooldown', name: 'Slow control cooldown', instructions: 'Very slow singles, focus on identical sound from both hands.', startBpm: 50, maxBpm: 70, durationMin: 2 },
      ],
    },
    {
      id: 's2', title: 'Counting & Timing',
      desc: 'Lock quarter and eighth notes to the metronome.',
      goal: 'Hold eighth notes at 80 BPM for a minute', daysToAdvance: 5,
      exercises: [
        { id: 's2-quarters', name: 'Quarter notes', instructions: 'One hit per click, alternating hands. Land exactly on the beep.', startBpm: 70, maxBpm: 110, durationMin: 3 },
        { id: 's2-eighths', name: 'Eighth notes', instructions: 'Two even hits per click (1 & 2 & ...). Say "1 and 2 and" out loud.', startBpm: 70, maxBpm: 100, durationMin: 3 },
        { id: 's2-switch', name: 'Quarter/eighth switch', instructions: 'Two bars of quarters, two bars of eighths, repeat. Keep the pulse steady through the change.', startBpm: 70, maxBpm: 95, durationMin: 3 },
      ],
    },
    {
      id: 's3', title: 'Basic Rock Beat',
      desc: 'Your first groove: kick, snare and hi-hat together.',
      goal: 'Loop the beat for 8 bars without stopping', daysToAdvance: 6,
      exercises: [
        { id: 's3-hihat', name: 'Steady hi-hat eighths', instructions: 'Right hand only, eight even hits per bar.', startBpm: 70, maxBpm: 100, durationMin: 2 },
        { id: 's3-backbeat', name: 'Add the snare backbeat', instructions: 'Hi-hat eighths + snare (left) on beats 2 and 4.', startBpm: 70, maxBpm: 95, durationMin: 3 },
        { id: 's3-fullbeat', name: 'Full rock beat', instructions: 'Add kick on beats 1 and 3. Hi-hat 8ths, snare 2 & 4, kick 1 & 3.', startBpm: 70, maxBpm: 95, durationMin: 4 },
      ],
    },
    {
      id: 's4', title: 'Rudiments',
      desc: 'Singles, doubles and the mighty paradiddle.',
      goal: 'Clean paradiddle at 80 BPM', daysToAdvance: 6,
      exercises: [
        { id: 's4-doubles', name: 'Double strokes (R R L L)', instructions: 'Two hits per hand, let the second bounce. Keep all four even.', startBpm: 60, maxBpm: 100, durationMin: 3 },
        { id: 's4-paradiddle', name: 'Single paradiddle (R L R R / L R L L)', instructions: 'Say "para-diddle". Keep accents on the first note of each group.', startBpm: 60, maxBpm: 90, durationMin: 4 },
        { id: 's4-mixed', name: 'Singles / doubles / paradiddle ladder', instructions: 'One bar each, loop the cycle. Smooth transitions, no tempo dip.', startBpm: 60, maxBpm: 85, durationMin: 3 },
      ],
    },
    {
      id: 's5', title: 'Beat Variations & Fills',
      desc: 'Open up grooves and drop in simple fills.',
      goal: 'Play a 1-bar fill into a beat 4 times cleanly', daysToAdvance: 6,
      exercises: [
        { id: 's5-variation', name: 'Groove variation', instructions: 'Rock beat but add an extra kick on the "and" of 3.', startBpm: 70, maxBpm: 95, durationMin: 3 },
        { id: 's5-fill', name: 'One-bar single-stroke fill', instructions: 'Three bars of groove, one bar of eighth-note fill around the drums, repeat.', startBpm: 70, maxBpm: 90, durationMin: 4 },
        { id: 's5-trade', name: 'Trade beat & fill', instructions: 'Alternate 1 bar beat / 1 bar fill. Land back on beat 1 every time.', startBpm: 70, maxBpm: 90, durationMin: 3 },
      ],
    },
    {
      id: 's6', title: 'Playing Along to Songs',
      desc: 'Put it all together with real tracks.',
      goal: 'Play one full song end to end', daysToAdvance: 7,
      exercises: [
        { id: 's6-listen', name: 'Find the pulse', instructions: 'Pick a simple song; tap quarter notes along with it before playing.', durationMin: 2 },
        { id: 's6-groove', name: 'Play the groove along', instructions: 'Play the basic rock beat along with the song for a full verse.', startBpm: 80, maxBpm: 120, durationMin: 4 },
        { id: 's6-full', name: 'Full song run', instructions: 'Play start to finish: groove, simple fills at section changes, finish clean.', durationMin: 5 },
      ],
    },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = { CURRICULUM };
  else root.CURRICULUM = CURRICULUM;
})(typeof window !== 'undefined' ? window : this);
```

- [ ] **Step 3: Write the failing test** `test/curriculum.test.js`

```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const { CURRICULUM } = require('../workout-curriculum.js');

test('curriculum has 6 stages with required fields', () => {
  assert.strictEqual(CURRICULUM.length, 6);
  for (const st of CURRICULUM) {
    assert.ok(st.id && st.title && st.desc && st.goal, 'stage fields present');
    assert.ok(Number.isInteger(st.daysToAdvance) && st.daysToAdvance > 0);
    assert.ok(Array.isArray(st.exercises) && st.exercises.length > 0);
  }
});

test('every exercise id is unique and has name + instructions', () => {
  const ids = new Set();
  for (const st of CURRICULUM) for (const ex of st.exercises) {
    assert.ok(ex.id && ex.name && ex.instructions, 'exercise fields present');
    assert.ok(!ids.has(ex.id), 'duplicate id: ' + ex.id);
    ids.add(ex.id);
  }
});
```

- [ ] **Step 4: Run the tests, verify they pass**

Run: `npm test`
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json workout-curriculum.js test/curriculum.test.js
git commit -m "feat: add curriculum data and package scaffolding"
```

---

## Task 2: logic.js — dates, initial state, seeding

**Files:**
- Create: `logic.js`
- Create: `test/logic.test.js`

**Interfaces:**
- Produces:
  - `dateKey(date) -> "YYYY-MM-DD"` (local time)
  - `parseKey("YYYY-MM-DD") -> Date` (local midnight)
  - `addDays(date, n) -> Date`
  - `todayKey(now = new Date()) -> string`
  - `DEFAULT_NEEDS -> Array<{id,label,link?}>`
  - `DEFAULT_SETTINGS -> {tempoIncrement,bonusPerWant,metronomeBpm}`
  - `createInitialState() -> State`
  - `seedDay(curriculum, drumProgress, wantsList) -> Day` where
    `Day = { needs: Need[], wants: Want[], drum: { completed:false, counted:false, exercises: {id:false} } }`
  - `ensureDay(state, dayKey, curriculum) -> State` (seeds `history[dayKey]` if absent; returns new state, never mutates input)
- `module.exports` includes all of the above (and everything added in later tasks).

- [ ] **Step 1: Write the failing test** (append to `test/logic.test.js`; create the file)

```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const L = require('../logic.js');
const { CURRICULUM } = require('../workout-curriculum.js');

test('dateKey formats local YYYY-MM-DD', () => {
  assert.strictEqual(L.dateKey(new Date(2026, 5, 7)), '2026-06-07');
  assert.strictEqual(L.dateKey(new Date(2026, 11, 25)), '2026-12-25');
});

test('parseKey/addDays round-trip', () => {
  assert.strictEqual(L.dateKey(L.parseKey('2026-06-25')), '2026-06-25');
  assert.strictEqual(L.dateKey(L.addDays(L.parseKey('2026-06-25'), -1)), '2026-06-24');
  assert.strictEqual(L.dateKey(L.addDays(L.parseKey('2026-02-28'), 1)), '2026-03-01');
});

test('createInitialState has defaults', () => {
  const s = L.createInitialState();
  assert.strictEqual(s.version, 1);
  assert.deepStrictEqual(s.history, {});
  assert.deepStrictEqual(s.wantsList, ['Play basketball']);
  assert.strictEqual(s.drumProgress.stageIndex, 0);
  assert.strictEqual(s.drumProgress.daysInStage, 0);
  assert.strictEqual(s.settings.tempoIncrement, 2);
  assert.strictEqual(s.settings.bonusPerWant, 10);
});

test('seedDay creates fresh unchecked day from curriculum', () => {
  const dp = { stageIndex: 0, daysInStage: 0, tempos: {} };
  const day = L.seedDay(CURRICULUM, dp, ['Play basketball']);
  assert.strictEqual(day.needs.length, L.DEFAULT_NEEDS.length);
  assert.ok(day.needs.every(n => n.done === false));
  assert.ok(day.needs.some(n => n.link === 'drum'));
  assert.strictEqual(day.wants.length, 1);
  assert.strictEqual(day.wants[0].label, 'Play basketball');
  assert.strictEqual(day.drum.completed, false);
  assert.strictEqual(day.drum.counted, false);
  const stageEx = CURRICULUM[0].exercises.map(e => e.id);
  assert.deepStrictEqual(Object.keys(day.drum.exercises).sort(), stageEx.slice().sort());
  assert.ok(Object.values(day.drum.exercises).every(v => v === false));
});

test('ensureDay seeds missing day and is immutable', () => {
  const s0 = L.createInitialState();
  const s1 = L.ensureDay(s0, '2026-06-25', CURRICULUM);
  assert.ok(s1.history['2026-06-25']);
  assert.strictEqual(s0.history['2026-06-25'], undefined, 'input not mutated');
  const s2 = L.ensureDay(s1, '2026-06-25', CURRICULUM);
  assert.strictEqual(s2.history['2026-06-25'], s1.history['2026-06-25'], 'existing day untouched');
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test`
Expected: FAIL ("Cannot find module '../logic.js'").

- [ ] **Step 3: Create `logic.js`** with this content

```javascript
// logic.js — pure functions only. No DOM, no localStorage.
(function (root) {
  const KEY = 'jasonDaily.v1';

  const DEFAULT_NEEDS = [
    { id: 'devotion', label: 'Devotion' },
    { id: 'breakfast', label: 'Eat breakfast' },
    { id: 'bath', label: 'Take a bath' },
    { id: 'lunch', label: 'Eat lunch' },
    { id: 'hatid', label: 'Hatid luvie' },
    { id: 'sundo', label: 'Sundo luvie' },
    { id: 'drum', label: "Today's drum workout", link: 'drum' },
  ];
  const DEFAULT_SETTINGS = { tempoIncrement: 2, bonusPerWant: 10, metronomeBpm: 80 };

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseKey(k) { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function todayKey(now) { return dateKey(now || new Date()); }

  function createInitialState() {
    return {
      version: 1,
      history: {},
      wantsList: ['Play basketball'],
      drumProgress: { stageIndex: 0, daysInStage: 0, tempos: {} },
      settings: Object.assign({}, DEFAULT_SETTINGS),
    };
  }

  function currentStage(curriculum, stageIndex) {
    const i = Math.max(0, Math.min(stageIndex, curriculum.length - 1));
    return curriculum[i];
  }

  function seedDay(curriculum, drumProgress, wantsList) {
    const stage = currentStage(curriculum, drumProgress.stageIndex);
    const exercises = {};
    stage.exercises.forEach(e => { exercises[e.id] = false; });
    return {
      needs: DEFAULT_NEEDS.map(n => Object.assign({ done: false, source: 'default' }, n)),
      wants: (wantsList || []).map((label, i) => ({ id: 'w-' + i + '-' + label, label, done: false })),
      drum: { completed: false, counted: false, exercises },
    };
  }

  function ensureDay(state, dayKey, curriculum) {
    if (state.history[dayKey]) return state;
    const day = seedDay(curriculum, state.drumProgress, state.wantsList);
    const history = Object.assign({}, state.history); history[dayKey] = day;
    return Object.assign({}, state, { history });
  }

  const api = {
    KEY, DEFAULT_NEEDS, DEFAULT_SETTINGS,
    dateKey, parseKey, addDays, todayKey,
    createInitialState, currentStage, seedDay, ensureDay,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof window !== 'undefined' ? window : this);
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat: add date helpers, initial state, and daily seeding"
```

---

## Task 3: logic.js — reads (percent, bonus, perfect day, streak)

**Files:**
- Modify: `logic.js`
- Modify: `test/logic.test.js`

**Interfaces:**
- Produces:
  - `doneNeedsCount(day) -> number`, `totalNeeds(day) -> number`
  - `computeNeedsPct(day) -> number` (0–100 integer; 0 if no needs)
  - `bonusCount(day) -> number` (completed wants)
  - `computeBonus(day, bonusPerWant) -> number`
  - `counterValue(day, bonusPerWant) -> number` (pct, or `100 + bonus` when pct ≥ 100)
  - `isPerfectDay(day) -> boolean` (has ≥1 need and all done)
  - `computeStreak(history, todayKey) -> number`

- [ ] **Step 1: Write the failing tests** (append to `test/logic.test.js`)

```javascript
function dayWith(needsDone, wantsDone) {
  return {
    needs: needsDone.map((d, i) => ({ id: 'n' + i, label: 'n' + i, done: d })),
    wants: wantsDone.map((d, i) => ({ id: 'w' + i, label: 'w' + i, done: d })),
    drum: { completed: false, counted: false, exercises: {} },
  };
}

test('computeNeedsPct rounds done/total', () => {
  assert.strictEqual(L.computeNeedsPct(dayWith([true, true, false, false], [])), 50);
  assert.strictEqual(L.computeNeedsPct(dayWith([true, true, true], [])), 100);
  assert.strictEqual(L.computeNeedsPct(dayWith([], [])), 0);
});

test('bonus and counter', () => {
  const d = dayWith([true, true, true], [true, true]);
  assert.strictEqual(L.computeBonus(d, 10), 20);
  assert.strictEqual(L.counterValue(d, 10), 120);
  const partial = dayWith([true, false], [true]);
  assert.strictEqual(L.counterValue(partial, 10), 50);
});

test('isPerfectDay', () => {
  assert.strictEqual(L.isPerfectDay(dayWith([true, true], [])), true);
  assert.strictEqual(L.isPerfectDay(dayWith([true, false], [])), false);
  assert.strictEqual(L.isPerfectDay(dayWith([], [])), false);
});

function completedDay(done) {
  const d = dayWith([true], []); d.drum.completed = done; return d;
}

test('computeStreak counts consecutive completed days, today anchor', () => {
  const h = {
    '2026-06-23': completedDay(true),
    '2026-06-24': completedDay(true),
    '2026-06-25': completedDay(true),
  };
  assert.strictEqual(L.computeStreak(h, '2026-06-25'), 3);
});

test('computeStreak uses yesterday anchor when today not done', () => {
  const h = {
    '2026-06-23': completedDay(true),
    '2026-06-24': completedDay(true),
    '2026-06-25': completedDay(false),
  };
  assert.strictEqual(L.computeStreak(h, '2026-06-25'), 2);
});

test('computeStreak breaks on a gap', () => {
  const h = {
    '2026-06-22': completedDay(true),
    '2026-06-24': completedDay(true),
    '2026-06-25': completedDay(true),
  };
  assert.strictEqual(L.computeStreak(h, '2026-06-25'), 2);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test`
Expected: FAIL ("L.computeNeedsPct is not a function").

- [ ] **Step 3: Add to `logic.js`** (before the `api` object, then add each to `api`)

```javascript
  function doneNeedsCount(day) { return day.needs.filter(n => n.done).length; }
  function totalNeeds(day) { return day.needs.length; }
  function computeNeedsPct(day) {
    const t = totalNeeds(day); if (!t) return 0;
    return Math.round(doneNeedsCount(day) / t * 100);
  }
  function bonusCount(day) { return day.wants.filter(w => w.done).length; }
  function computeBonus(day, bonusPerWant) { return bonusCount(day) * bonusPerWant; }
  function counterValue(day, bonusPerWant) {
    const pct = computeNeedsPct(day);
    return pct >= 100 ? 100 + computeBonus(day, bonusPerWant) : pct;
  }
  function isPerfectDay(day) {
    return day.needs.length > 0 && day.needs.every(n => n.done);
  }
  function isDayCompleted(day) { return !!(day && day.drum && day.drum.completed); }
  function computeStreak(history, todayK) {
    let cur = parseKey(todayK);
    if (!isDayCompleted(history[todayK])) cur = addDays(cur, -1);
    let streak = 0;
    while (isDayCompleted(history[dateKey(cur)])) { streak++; cur = addDays(cur, -1); }
    return streak;
  }
```

Add these names to the `api` object:
`doneNeedsCount, totalNeeds, computeNeedsPct, bonusCount, computeBonus, counterValue, isPerfectDay, computeStreak,`

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat: add percent, bonus, perfect-day and streak reads"
```

---

## Task 4: logic.js — needs/wants/adhoc transitions

**Files:**
- Modify: `logic.js`
- Modify: `test/logic.test.js`

**Interfaces:**
- Produces (all return a NEW state, never mutate input; all take `curriculum` where a day may need seeding first):
  - `toggleWant(state, dayKey, wantId) -> State`
  - `addAdhocNeed(state, dayKey, label) -> State` (appends `{id:'adhoc-'+ts, label, done:false, source:'adhoc'}`)
  - `removeNeed(state, dayKey, needId) -> State` (removes a need; used by ad-hoc removal)
  - `addWant(state, dayKey, label) -> State` (appends to `wantsList` and the day's `wants`)
  - `removeWant(state, dayKey, label) -> State` (removes from `wantsList` and the day's `wants`)
- Helper (internal): `updateDay(state, dayKey, fn)` clones the day, applies `fn`, returns new state.

- [ ] **Step 1: Write the failing tests** (append)

```javascript
const C = CURRICULUM;
function freshState(dayKey) { return L.ensureDay(L.createInitialState(), dayKey, C); }

test('toggleWant flips only that want', () => {
  let s = freshState('2026-06-25');
  const wid = s.history['2026-06-25'].wants[0].id;
  s = L.toggleWant(s, '2026-06-25', wid);
  assert.strictEqual(s.history['2026-06-25'].wants[0].done, true);
  s = L.toggleWant(s, '2026-06-25', wid);
  assert.strictEqual(s.history['2026-06-25'].wants[0].done, false);
});

test('addAdhocNeed appends a removable need that counts', () => {
  let s = freshState('2026-06-25');
  const before = s.history['2026-06-25'].needs.length;
  s = L.addAdhocNeed(s, '2026-06-25', 'Call mom');
  const needs = s.history['2026-06-25'].needs;
  assert.strictEqual(needs.length, before + 1);
  const added = needs[needs.length - 1];
  assert.strictEqual(added.label, 'Call mom');
  assert.strictEqual(added.source, 'adhoc');
  s = L.removeNeed(s, '2026-06-25', added.id);
  assert.strictEqual(s.history['2026-06-25'].needs.length, before);
});

test('addWant/removeWant affect wantsList and today', () => {
  let s = freshState('2026-06-25');
  s = L.addWant(s, '2026-06-25', 'Read 10 pages');
  assert.ok(s.wantsList.includes('Read 10 pages'));
  assert.ok(s.history['2026-06-25'].wants.some(w => w.label === 'Read 10 pages'));
  s = L.removeWant(s, '2026-06-25', 'Read 10 pages');
  assert.ok(!s.wantsList.includes('Read 10 pages'));
  assert.ok(!s.history['2026-06-25'].wants.some(w => w.label === 'Read 10 pages'));
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test`
Expected: FAIL ("L.toggleWant is not a function").

- [ ] **Step 3: Add to `logic.js`**

```javascript
  function updateDay(state, dayKey, fn) {
    const day = state.history[dayKey];
    const newDay = fn(JSON.parse(JSON.stringify(day)));
    const history = Object.assign({}, state.history); history[dayKey] = newDay;
    return Object.assign({}, state, { history });
  }
  function toggleWant(state, dayKey, wantId) {
    return updateDay(state, dayKey, d => {
      d.wants = d.wants.map(w => w.id === wantId ? Object.assign({}, w, { done: !w.done }) : w);
      return d;
    });
  }
  function addAdhocNeed(state, dayKey, label) {
    const text = (label || '').trim(); if (!text) return state;
    return updateDay(state, dayKey, d => {
      d.needs = d.needs.concat([{ id: 'adhoc-' + Date.now(), label: text, done: false, source: 'adhoc' }]);
      return d;
    });
  }
  function removeNeed(state, dayKey, needId) {
    return updateDay(state, dayKey, d => { d.needs = d.needs.filter(n => n.id !== needId); return d; });
  }
  function addWant(state, dayKey, label) {
    const text = (label || '').trim(); if (!text) return state;
    let next = state;
    if (!next.wantsList.includes(text)) next = Object.assign({}, next, { wantsList: next.wantsList.concat([text]) });
    return updateDay(next, dayKey, d => {
      if (!d.wants.some(w => w.label === text)) d.wants = d.wants.concat([{ id: 'w-add-' + Date.now(), label: text, done: false }]);
      return d;
    });
  }
  function removeWant(state, dayKey, label) {
    const next = Object.assign({}, state, { wantsList: state.wantsList.filter(l => l !== label) });
    return updateDay(next, dayKey, d => { d.wants = d.wants.filter(w => w.label !== label); return d; });
  }
```

Add to `api`: `updateDay, toggleWant, addAdhocNeed, removeNeed, addWant, removeWant,`

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat: add needs/wants/adhoc state transitions"
```

---

## Task 5: logic.js — drum workout transitions, tempo progression, stage advancement

**Files:**
- Modify: `logic.js`
- Modify: `test/logic.test.js`

**Interfaces:**
- Produces:
  - `exerciseTempo(tempos, exercise) -> number|undefined` (`tempos[id]` ?? `exercise.startBpm`)
  - `isWorkoutComplete(day, stage) -> boolean` (stage has exercises and all are done in the day)
  - `nextTempo(current, increment, maxBpm) -> number`
  - `toggleExercise(state, dayKey, exerciseId, curriculum) -> State`
  - `setWorkoutComplete(state, dayKey, complete, curriculum) -> State`
  - Both transitions keep the `link:'drum'` need's `done` in sync with `day.drum.completed`, and on the FIRST time a day becomes complete they: set `day.drum.counted=true`, increment `drumProgress.daysInStage`, bump each stage exercise's tempo by `settings.tempoIncrement` (capped at `maxBpm`), and advance the stage if `daysInStage >= stage.daysToAdvance` (reset `daysInStage` to 0, increment `stageIndex`, capped at last stage). Progression applies at most once per day (guarded by `counted`); unchecking does not reverse tempo/daysInStage.

- [ ] **Step 1: Write the failing tests** (append)

```javascript
function stage0Ids() { return C[0].exercises.map(e => e.id); }

test('exerciseTempo falls back to startBpm', () => {
  assert.strictEqual(L.exerciseTempo({}, { id: 'x', startBpm: 60 }), 60);
  assert.strictEqual(L.exerciseTempo({ x: 72 }, { id: 'x', startBpm: 60 }), 72);
});

test('nextTempo respects cap', () => {
  assert.strictEqual(L.nextTempo(60, 2, 100), 62);
  assert.strictEqual(L.nextTempo(99, 2, 100), 100);
  assert.strictEqual(L.nextTempo(60, 2, undefined), 62);
});

test('toggling all exercises completes the workout and syncs the drum need', () => {
  let s = freshState('2026-06-25');
  for (const id of stage0Ids()) s = L.toggleExercise(s, '2026-06-25', id, C);
  const day = s.history['2026-06-25'];
  assert.strictEqual(day.drum.completed, true);
  assert.strictEqual(day.needs.find(n => n.link === 'drum').done, true);
});

test('setWorkoutComplete(true) bumps tempos and daysInStage once', () => {
  let s = freshState('2026-06-25');
  s = L.setWorkoutComplete(s, '2026-06-25', true, C);
  assert.strictEqual(s.drumProgress.daysInStage, 1);
  const ex0 = C[0].exercises.find(e => e.startBpm);
  assert.strictEqual(s.drumProgress.tempos[ex0.id], ex0.startBpm + 2);
  // toggling off then on again must NOT double-count
  s = L.setWorkoutComplete(s, '2026-06-25', false, C);
  s = L.setWorkoutComplete(s, '2026-06-25', true, C);
  assert.strictEqual(s.drumProgress.daysInStage, 1);
  assert.strictEqual(s.drumProgress.tempos[ex0.id], ex0.startBpm + 2);
});

test('stage advances after daysToAdvance completed days', () => {
  let s = L.createInitialState();
  const days = ['2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24'];
  for (const k of days) { s = L.ensureDay(s, k, C); s = L.setWorkoutComplete(s, k, true, C); }
  assert.strictEqual(s.drumProgress.stageIndex, 1, 'advanced after 5 days');
  assert.strictEqual(s.drumProgress.daysInStage, 0);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test`
Expected: FAIL ("L.exerciseTempo is not a function").

- [ ] **Step 3: Add to `logic.js`**

```javascript
  function exerciseTempo(tempos, exercise) {
    return (tempos && tempos[exercise.id] != null) ? tempos[exercise.id] : exercise.startBpm;
  }
  function isWorkoutComplete(day, stage) {
    if (!stage.exercises.length) return false;
    return stage.exercises.every(e => day.drum.exercises[e.id] === true);
  }
  function nextTempo(current, increment, maxBpm) {
    const v = current + increment;
    return (maxBpm != null) ? Math.min(v, maxBpm) : v;
  }
  function applyProgression(state, curriculum) {
    // increments daysInStage, bumps tempos, advances stage. Returns new drumProgress.
    const dp = JSON.parse(JSON.stringify(state.drumProgress));
    const stage = currentStage(curriculum, dp.stageIndex);
    stage.exercises.forEach(e => {
      if (e.startBpm == null) return;
      const cur = (dp.tempos[e.id] != null) ? dp.tempos[e.id] : e.startBpm;
      dp.tempos[e.id] = nextTempo(cur, state.settings.tempoIncrement, e.maxBpm);
    });
    dp.daysInStage += 1;
    if (dp.daysInStage >= stage.daysToAdvance && dp.stageIndex < curriculum.length - 1) {
      dp.stageIndex += 1; dp.daysInStage = 0;
    }
    return dp;
  }
  function applyDrumState(state, dayKey, complete, curriculum) {
    const stage = currentStage(curriculum, state.drumProgress.stageIndex);
    let progressed = false;
    let next = updateDay(state, dayKey, d => {
      stage.exercises.forEach(e => { d.drum.exercises[e.id] = complete; });
      d.drum.completed = complete;
      const dn = d.needs.find(n => n.link === 'drum'); if (dn) dn.done = complete;
      if (complete && !d.drum.counted) { d.drum.counted = true; progressed = true; }
      return d;
    });
    if (progressed) next = Object.assign({}, next, { drumProgress: applyProgression(next, curriculum) });
    return next;
  }
  function setWorkoutComplete(state, dayKey, complete, curriculum) {
    return applyDrumState(state, dayKey, complete, curriculum);
  }
  function toggleExercise(state, dayKey, exerciseId, curriculum) {
    const stage = currentStage(curriculum, state.drumProgress.stageIndex);
    let progressed = false;
    let next = updateDay(state, dayKey, d => {
      d.drum.exercises[exerciseId] = !d.drum.exercises[exerciseId];
      const done = stage.exercises.every(e => d.drum.exercises[e.id] === true);
      d.drum.completed = done;
      const dn = d.needs.find(n => n.link === 'drum'); if (dn) dn.done = done;
      if (done && !d.drum.counted) { d.drum.counted = true; progressed = true; }
      return d;
    });
    if (progressed) next = Object.assign({}, next, { drumProgress: applyProgression(next, curriculum) });
    return next;
  }
```

Add to `api`: `exerciseTempo, isWorkoutComplete, nextTempo, setWorkoutComplete, toggleExercise,`

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat: add drum workout transitions, tempo progression, stage advancement"
```

---

## Task 6: logic.js — serialize / deserialize / migrate

**Files:**
- Modify: `logic.js`
- Modify: `test/logic.test.js`

**Interfaces:**
- Produces:
  - `serialize(state) -> string` (JSON)
  - `migrate(raw) -> State` (coerce any object into a valid state, filling defaults; clamp `stageIndex`/`daysInStage` ≥ 0)
  - `deserialize(jsonString) -> { ok: boolean, state: State|null }` (false on parse error or non-object)

- [ ] **Step 1: Write the failing tests** (append)

```javascript
test('serialize/deserialize round-trip', () => {
  let s = freshState('2026-06-25');
  s = L.toggleWant(s, '2026-06-25', s.history['2026-06-25'].wants[0].id);
  const json = L.serialize(s);
  const r = L.deserialize(json);
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.state, s);
});

test('deserialize rejects malformed json', () => {
  assert.strictEqual(L.deserialize('not json').ok, false);
  assert.strictEqual(L.deserialize('123').ok, false);
  assert.strictEqual(L.deserialize('null').ok, false);
});

test('migrate fills defaults for partial objects', () => {
  const s = L.migrate({ history: { '2026-06-25': { needs: [], wants: [], drum: { completed: false, counted: false, exercises: {} } } } });
  assert.strictEqual(s.version, 1);
  assert.deepStrictEqual(s.wantsList, ['Play basketball']);
  assert.strictEqual(s.drumProgress.stageIndex, 0);
  assert.strictEqual(s.settings.bonusPerWant, 10);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test`
Expected: FAIL ("L.serialize is not a function").

- [ ] **Step 3: Add to `logic.js`**

```javascript
  function serialize(state) { return JSON.stringify(state, null, 2); }
  function migrate(raw) {
    const base = createInitialState();
    if (!raw || typeof raw !== 'object') return base;
    const dp = raw.drumProgress && typeof raw.drumProgress === 'object' ? raw.drumProgress : {};
    return {
      version: 1,
      history: (raw.history && typeof raw.history === 'object') ? raw.history : {},
      wantsList: Array.isArray(raw.wantsList) ? raw.wantsList.slice() : base.wantsList,
      drumProgress: {
        stageIndex: Math.max(0, dp.stageIndex | 0),
        daysInStage: Math.max(0, dp.daysInStage | 0),
        tempos: (dp.tempos && typeof dp.tempos === 'object') ? dp.tempos : {},
      },
      settings: Object.assign({}, base.settings, (raw.settings && typeof raw.settings === 'object') ? raw.settings : {}),
    };
  }
  function deserialize(jsonString) {
    let raw;
    try { raw = JSON.parse(jsonString); } catch (e) { return { ok: false, state: null }; }
    if (!raw || typeof raw !== 'object') return { ok: false, state: null };
    return { ok: true, state: migrate(raw) };
  }
```

Add to `api`: `serialize, migrate, deserialize,`

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test`
Expected: all PASS. (Round-trip relies on `freshState` producing a fully-defaulted state.)

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat: add serialize, deserialize, and migrate"
```

---

## Task 7: index.html — shell, CSS, storage glue, router, top bar

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `window.Logic` (from `logic.js`), `window.CURRICULUM` (from `workout-curriculum.js`).
- Produces: global app object with `state`, `save()`, `render()`, `screen` ('today'|'drums'); `#app` container; helper `el(tag, attrs, children)`.

This task is verified manually in a browser (no unit test). Build the skeleton that loads scripts, restores or seeds state, ensures today's day exists, renders the top bar with Today/Drums nav and the backup menu, and switches screens. Today/Drums bodies are stubbed (filled in Tasks 8–9).

- [ ] **Step 1: Create `index.html`** with the shell

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Jason Daily</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#EFE5D4; --card:#FFFFFF; --ink:#4B4139; --muted:#9C8E7F; --faint:#C0AE9A;
    --line:#EFE5D4; --line2:#EBDECB;
    --coral:#F2A07B; --gold:#F6C56B; --green:#6FBF93; --green2:#9FD3B4;
  }
  *{box-sizing:border-box}
  body{margin:0;background:linear-gradient(180deg,#FBF6EE 0%,#F2E8D8 100%);min-height:100vh;
    font-family:'Nunito',system-ui,-apple-system,sans-serif;color:var(--ink)}
  .wrap{max-width:1180px;margin:0 auto;padding:26px 20px 80px}
  .fred{font-family:'Fredoka',system-ui,sans-serif}
  .grad{background:linear-gradient(135deg,var(--coral),var(--gold))}
  .gradg{background:linear-gradient(135deg,var(--green),var(--green2))}
  button{font-family:inherit}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:26px;flex-wrap:wrap}
  .brand{display:flex;align-items:center;gap:14px}
  .logo{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px -8px rgba(242,160,123,.9)}
  .logo span{width:22px;height:22px;border-radius:50%;border:3px solid #fff;display:block}
  .eyebrow{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
  .h1{font-weight:700;font-size:26px;line-height:1.1}
  .nav{display:flex;gap:5px;background:#FFFDF8;border:1.5px solid var(--line2);border-radius:16px;padding:5px}
  .nav button{border:none;background:transparent;cursor:pointer;border-radius:12px;padding:9px 18px;font-size:15px;font-weight:600;color:#A99A86}
  .nav button.active{color:#fff}
  .iconbtn{width:46px;height:46px;border-radius:14px;border:1.5px solid var(--line2);background:#FFFDF8;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .menu{position:absolute;right:0;top:54px;width:220px;background:#FFFDF8;border:1.5px solid var(--line2);border-radius:18px;padding:10px;box-shadow:0 18px 40px -18px rgba(100,70,40,.5);z-index:30}
  .menu button{width:100%;text-align:left;border:none;background:#F6EFE2;border-radius:12px;padding:11px 12px;font-weight:700;font-size:14px;color:var(--ink);cursor:pointer;margin-bottom:6px}
  .card{background:var(--card);border:1px solid #F2E7D6;border-radius:24px;box-shadow:0 10px 26px -18px rgba(120,80,40,.4)}
  @media (max-width:720px){ .h1{font-size:22px} .wrap{padding:18px 14px 80px} }
</style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="brand">
        <div class="logo grad"><span></span></div>
        <div>
          <div class="eyebrow" id="hdr-date"></div>
          <div class="h1 fred" id="hdr-title">Hi, luvie</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <div class="nav" id="nav"></div>
        <div style="position:relative">
          <button class="iconbtn" id="backup-btn" aria-label="Backup">
            <span style="display:block;width:18px;height:2.5px;border-radius:2px;background:#9C8B79;box-shadow:0 6px 0 #9C8B79,0 -6px 0 #9C8B79"></span>
          </button>
          <div class="menu" id="backup-menu" style="display:none">
            <div class="eyebrow" style="padding:4px 8px 8px">Backup &amp; restore</div>
            <button id="export-btn">Export progress</button>
            <button id="import-btn">Import from file</button>
            <input id="import-input" type="file" accept="application/json,.json" style="display:none">
          </div>
        </div>
      </div>
    </div>
    <div id="app"></div>
  </div>

<script src="logic.js"></script>
<script src="workout-curriculum.js"></script>
<script>
(function(){
  var L = window.Logic, CUR = window.CURRICULUM;
  var App = window.App = {
    screen: 'today',
    state: null,
    load: function(){
      var raw = null;
      try { raw = localStorage.getItem(L.KEY); } catch(e){}
      var s = raw ? L.deserialize(raw) : { ok:false };
      this.state = s.ok ? s.state : L.createInitialState();
      this.state = L.ensureDay(this.state, L.todayKey(), CUR);
      this.save();
    },
    save: function(){
      try { localStorage.setItem(L.KEY, L.serialize(this.state)); } catch(e){}
    },
    set: function(newState){ this.state = newState; this.save(); this.render(); },
    today: function(){ return L.todayKey(); },
    render: function(){ renderAll(); }
  };

  function el(tag, attrs, children){
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function(k){
      if (k === 'style') n.setAttribute('style', attrs[k]);
      else if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function(c){ if (c == null) return; n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  window.el = el;

  function renderTopbar(){
    var now = new Date();
    document.getElementById('hdr-date').textContent = now.toLocaleDateString('default',{weekday:'long',month:'long',day:'numeric'});
    document.getElementById('hdr-title').textContent = App.screen === 'today' ? 'Hi, luvie' : 'Drum Journey';
    var nav = document.getElementById('nav'); nav.innerHTML = '';
    [['today','Today'],['drums','Drums']].forEach(function(p){
      var active = App.screen === p[0];
      nav.appendChild(el('button', { class: active ? 'active grad' : '', onClick: function(){ App.screen = p[0]; closeMenu(); renderAll(); } }, [p[1]]));
    });
  }

  function closeMenu(){ document.getElementById('backup-menu').style.display = 'none'; }
  document.getElementById('backup-btn').addEventListener('click', function(e){
    e.stopPropagation();
    var m = document.getElementById('backup-menu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', closeMenu);
  document.getElementById('backup-menu').addEventListener('click', function(e){ e.stopPropagation(); });
  document.getElementById('export-btn').addEventListener('click', function(){
    var blob = new Blob([L.serialize(App.state)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'jason-daily-backup.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000); closeMenu();
  });
  document.getElementById('import-btn').addEventListener('click', function(){ document.getElementById('import-input').click(); });
  document.getElementById('import-input').addEventListener('change', function(e){
    var file = e.target.files && e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      var r = L.deserialize(reader.result);
      if (!r.ok) { alert('That file is not a valid backup.'); return; }
      App.set(L.ensureDay(r.state, L.todayKey(), CUR));
    };
    reader.readAsText(file); e.target.value = ''; closeMenu();
  });

  // Re-seed across midnight when the tab regains focus.
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden) { App.state = L.ensureDay(App.state, L.todayKey(), CUR); App.save(); renderAll(); }
  });

  function renderAll(){
    renderTopbar();
    var app = document.getElementById('app'); app.innerHTML = '';
    if (App.screen === 'today') app.appendChild(window.renderToday ? window.renderToday() : el('div',{},['Today']));
    else app.appendChild(window.renderDrums ? window.renderDrums() : el('div',{},['Drums']));
  }
  window.renderAll = renderAll;

  App.load(); renderAll();
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify in a browser**

Run: `open index.html` (macOS) or load it in a browser.
Expected: top bar shows today's date, "Hi, luvie", a Today/Drums toggle that switches the body text, and a backup menu that opens, exports a JSON file, and imports one. No console errors. Confirm `localStorage` has key `jasonDaily.v1`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add app shell, storage, router and backup menu"
```

---

## Task 8: index.html — Today screen (ring, tasks, wants, calendar, confetti)

**Files:**
- Modify: `index.html` (add a `<script>` block defining `window.renderToday` before the bootstrap script; add the confetti keyframes/CSS to the `<style>`).

**Interfaces:**
- Consumes: `window.App`, `window.el`, `window.Logic`, `window.CURRICULUM`.
- Produces: `window.renderToday() -> HTMLElement`.

- [ ] **Step 1: Add confetti + Today CSS** to the `<style>` block

```css
  @keyframes hdPop{0%{transform:scale(.85);opacity:.4}55%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}
  @keyframes hdFloat{0%{transform:translateY(0) scale(.5) rotate(0);opacity:0}12%{opacity:1}100%{transform:translateY(-160px) scale(1) rotate(140deg);opacity:0}}
  @keyframes hdGlow{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.05)}}
  .hero{position:relative;display:flex;align-items:center;gap:34px;background:linear-gradient(120deg,#FFFFFF,#FFF5EA);border:1px solid #F2E7D6;border-radius:28px;padding:28px 36px;box-shadow:0 14px 38px -20px rgba(120,80,40,.45);overflow:hidden}
  .grid2{display:grid;grid-template-columns:1.4fr 1fr;gap:24px;align-items:start;margin-top:24px}
  .task{display:flex;align-items:center;gap:14px;border-radius:18px;padding:15px 18px;min-height:60px;cursor:pointer}
  .task .ck{width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center}
  .rm{border:none;background:transparent;color:#D8C9B4;font-size:18px;cursor:pointer;padding:4px;line-height:1}
  .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .cell{aspect-ratio:1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
  @media (max-width:720px){ .hero{flex-direction:column;text-align:center;gap:20px;padding:22px} .grid2{grid-template-columns:1fr} }
```

- [ ] **Step 2: Add the Today render script** (place this `<script>` immediately before the bootstrap `<script>` that calls `App.load()`)

```html
<script>
(function(){
  var L = window.Logic, CUR = window.CURRICULUM, el = window.el;
  var COLORS = ['#F2A07B','#F6C56B','#9FD3B4','#97C2E0','#C5B2E6','#F2A6C2'];
  var addingTask = false, newTaskText = '';

  function ring(pct, celebrate, counterLabel){
    var C = 527.79, off = C * (1 - Math.min(100,pct)/100);
    var box = el('div',{ style:'position:relative;width:208px;height:208px;flex-shrink:0' });
    if (celebrate) box.appendChild(el('div',{ style:'position:absolute;inset:6px;border-radius:50%;background:radial-gradient(circle,rgba(246,197,107,.5),rgba(159,211,180,0) 70%);animation:hdGlow 2.6s ease-in-out infinite' }));
    var svg = '<svg viewBox="0 0 200 200" style="width:208px;height:208px;display:block;position:relative">'
      + '<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2A07B"/><stop offset="1" stop-color="#F6C56B"/></linearGradient>'
      + '<linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6FBF93"/><stop offset="1" stop-color="#F6C56B"/></linearGradient></defs>'
      + '<circle cx="100" cy="100" r="84" fill="none" stroke="#F0E7D7" stroke-width="18"></circle>'
      + '<circle cx="100" cy="100" r="84" fill="none" stroke="url(#'+(celebrate?'rg':'rc')+')" stroke-width="18" stroke-linecap="round" stroke-dasharray="527.79" stroke-dashoffset="'+off+'" transform="rotate(-90 100 100)" style="transition:stroke-dashoffset .75s cubic-bezier(.2,.8,.2,1)"></circle></svg>';
    box.appendChild(el('div',{ html: svg }));
    box.appendChild(el('div',{ style:'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none' },[
      el('div',{ class:'fred', style:'font-weight:700;font-size:54px;line-height:1' },[counterLabel]),
      el('div',{ class:'eyebrow', style:'margin-top:4px' },['complete'])
    ]));
    return box;
  }

  function confetti(){
    var wrap = el('div',{ style:'position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:4' });
    for (var i=0;i<16;i++){
      wrap.appendChild(el('span',{ style:'position:absolute;left:'+(5+i*5.8)+'%;top:4%;width:9px;height:9px;border-radius:'+(i%2?'50%':'2px')+';background:'+COLORS[i%6]+';opacity:0;animation:hdFloat '+(2.2+(i%4)*0.5)+'s ease-in '+((i%6)*0.3)+'s infinite' }));
    }
    return wrap;
  }

  function taskRow(day, n){
    var done = n.done;
    var row = el('div',{ class:'task', style: done
      ? 'background:linear-gradient(135deg,#FBEEE4,#FCF4E6);border:1.5px solid #F3DCC4;animation:hdPop .3s ease'
      : 'background:#fff;border:1.5px solid #EFE5D4;box-shadow:0 6px 16px -12px rgba(120,80,40,.4)',
      onClick: function(){ App.set(toggleNeed(App.state, App.today(), n)); }
    },[
      el('div',{ class: done ? 'ck grad' : 'ck', style: done ? 'box-shadow:0 4px 10px -4px rgba(242,160,123,.8)' : 'border:2.5px solid #E7B894', html: done ? '<span style="color:#fff;font-size:15px;font-weight:900">✓</span>' : '' }),
      el('div',{ style:'flex:1;font-weight:700;font-size:16px;color:'+(done?'#A2937F':'#4B4139')+';'+(done?'text-decoration:line-through;text-decoration-color:#E0C9AE':'') },[n.label]),
      n.source === 'adhoc' ? el('button',{ class:'rm', 'aria-label':'Remove', onClick:function(e){ e.stopPropagation(); App.set(L.removeNeed(App.state, App.today(), n.id)); } },['×']) : null
    ]);
    return row;
  }

  function toggleNeed(state, dayKey, n){
    if (n.link === 'drum') return L.setWorkoutComplete(state, dayKey, !App.state.history[dayKey].drum.completed, CUR);
    return L.updateDay(state, dayKey, function(d){ d.needs = d.needs.map(function(x){ return x.id===n.id?Object.assign({},x,{done:!x.done}):x; }); return d; });
  }

  function calendar(){
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    var startDow = new Date(y,m,1).getDay(), days = new Date(y,m+1,0).getDate(), today = now.getDate();
    var grid = el('div',{ class:'cal' });
    for (var i=0;i<startDow;i++) grid.appendChild(el('div',{}));
    for (var dd=1; dd<=days; dd++){
      var key = L.dateKey(new Date(y,m,dd));
      var perfect = App.state.history[key] && L.isPerfectDay(App.state.history[key]);
      var isToday = dd === today;
      var style = perfect
        ? 'color:#fff;box-shadow:0 5px 12px -6px rgba(242,160,123,.9)'
        : (isToday ? 'border:2px solid #E7B894;color:#C28A5C' : 'background:#F8F2E8;color:#B0A091');
      grid.appendChild(el('div',{ class: perfect ? 'cell grad' : 'cell', style: style },[String(dd)]));
    }
    return el('div',{ class:'card', style:'padding:20px 18px 18px' },[
      el('div',{ style:'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px' },[
        el('div',{ class:'fred', style:'font-weight:600;font-size:19px' },[now.toLocaleString('default',{month:'long',year:'numeric'})]),
        el('div',{ style:'display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#B0A091' },[
          el('span',{ class:'grad', style:'width:11px;height:11px;border-radius:50%;display:inline-block' }),'Perfect' ])
      ]),
      el('div',{ class:'cal', style:'margin-bottom:8px' }, 'SMTWTFS'.split('').map(function(c){ return el('div',{ style:'text-align:center;font-size:11px;font-weight:800;color:#CBBBA6' },[c]); })),
      grid
    ]);
  }

  function wantsCard(day){
    var per = App.state.settings.bonusPerWant;
    var rows = day.wants.map(function(w){
      return el('div',{ style:'cursor:pointer;margin-bottom:8px' , onClick: function(){ App.set(L.toggleWant(App.state, App.today(), w.id)); } },[
        el('div',{ style:'display:flex;align-items:center;gap:12px;border-radius:16px;padding:13px 14px;'+(w.done?'background:linear-gradient(135deg,#D5EFDF,#F6EAC8);border:1.5px solid #A9DBBC':'background:rgba(255,255,255,.65);border:1.5px solid #CDE7D6') },[
          el('div',{ class: w.done?'gradg':'', style:'width:24px;height:24px;border-radius:8px;flex-shrink:0;'+(w.done?'display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:13px':'border:2.5px solid #8FCBA6'), html: w.done?'✓':'' }),
          el('div',{ style:'flex:1;font-weight:700;font-size:15px;color:#3E5A47' },[w.label]),
          el('button',{ class:'rm', 'aria-label':'Remove want', onClick:function(e){ e.stopPropagation(); App.set(L.removeWant(App.state, App.today(), w.label)); } },['×']),
          el('div',{ style:'font-weight:800;font-size:13px;color:#6FBF93' },['+'+per+'%'])
        ])
      ]);
    });
    var addRow = el('div',{ style:'display:flex;gap:8px;margin-top:4px' },[
      el('input',{ id:'want-input', placeholder:'Add a want…', style:'flex:1;border:1.5px solid #B6DEC4;background:#fff;border-radius:14px;padding:11px 13px;font-family:inherit;font-weight:700;font-size:14px;color:#3E5A47;outline:none',
        onKeydown:function(e){ if(e.key==='Enter'){ var v=e.target.value; if(v.trim()){ App.set(L.addWant(App.state, App.today(), v)); } } } }),
      el('button',{ class:'gradg', style:'border:none;color:#fff;font-weight:700;padding:0 16px;border-radius:14px;cursor:pointer', onClick:function(){ var inp=document.getElementById('want-input'); if(inp.value.trim()){ App.set(L.addWant(App.state, App.today(), inp.value)); } } },['Add'])
    ]);
    return el('div',{ style:'background:linear-gradient(135deg,#EAF6EE,#FBF3DD);border:1.5px dashed #B6DEC4;border-radius:24px;padding:20px 18px 16px' },[
      el('div',{ style:'margin-bottom:12px' },[
        el('div',{ class:'fred', style:'font-weight:600;font-size:19px;color:#3E5A47' },['★ Bonus round']),
        el('div',{ style:'font-size:13px;font-weight:600;color:#6E8E78;margin-top:3px' },['Optional wins that push you past 100%'])
      ])
    ].concat(rows).concat([addRow]));
  }

  function tasksColumn(day){
    var col = el('div',{});
    var doneN = L.doneNeedsCount(day), totalN = L.totalNeeds(day);
    col.appendChild(el('div',{ style:'display:flex;align-items:baseline;justify-content:space-between;margin:2px 4px 14px' },[
      el('div',{ class:'fred', style:'font-weight:600;font-size:21px' },["Today's tasks"]),
      el('div',{ style:'font-weight:800;font-size:14px;color:#B0A091' },[doneN+'/'+totalN+' done'])
    ]));
    day.needs.forEach(function(n){ col.appendChild(taskRow(day, n)); });
    if (addingTask){
      col.appendChild(el('div',{ style:'display:flex;gap:8px;margin-top:2px' },[
        el('input',{ id:'task-input', value:newTaskText, placeholder:'New task…', style:'flex:1;border:1.5px solid #E7B894;background:#FFFDF8;border-radius:16px;padding:14px 16px;font-family:inherit;font-weight:700;font-size:15px;outline:none',
          onInput:function(e){ newTaskText=e.target.value; }, onKeydown:function(e){ if(e.key==='Enter'){ commitTask(); } else if(e.key==='Escape'){ addingTask=false; newTaskText=''; window.renderAll(); } } }),
        el('button',{ class:'grad', style:'border:none;color:#fff;font-weight:600;padding:0 20px;border-radius:16px;cursor:pointer', onClick:commitTask },['Add']),
        el('button',{ style:'border:1.5px solid #EFE5D4;background:#fff;color:#A2937F;font-weight:700;padding:0 16px;border-radius:16px;cursor:pointer', onClick:function(){ addingTask=false; newTaskText=''; window.renderAll(); } },['✕'])
      ]));
    } else {
      col.appendChild(el('button',{ style:'width:100%;border:2px dashed #E2CBB0;background:transparent;border-radius:18px;padding:15px;font-family:\'Fredoka\';font-weight:500;font-size:16px;color:#C29A75;cursor:pointer;margin-top:2px',
        onClick:function(){ addingTask=true; newTaskText=''; window.renderAll(); var i=document.getElementById('task-input'); if(i) i.focus(); } },['+ Add task for today']));
    }
    return col;
  }
  function commitTask(){ var v=(newTaskText||'').trim(); if(!v) return; addingTask=false; newTaskText=''; App.set(L.addAdhocNeed(App.state, App.today(), v)); }

  window.renderToday = function(){
    var day = App.state.history[App.today()];
    var pct = L.computeNeedsPct(day), per = App.state.settings.bonusPerWant;
    var bonus = L.computeBonus(day, per), counter = L.counterValue(day, per), celebrate = pct >= 100;
    var doneN = L.doneNeedsCount(day), totalN = L.totalNeeds(day);
    var statusText = (pct>=100 && bonus>0) ? ('Overachiever — '+counter+'% today!') : (pct>=100 ? 'Perfect day complete' : (doneN+' of '+totalN+' done — keep going'));

    var hero = el('div',{ class:'hero' },[
      celebrate ? confetti() : null,
      ring(pct, celebrate, counter+'%'),
      el('div',{ style:'flex:1;min-width:0' },[
        el('div',{ class:'eyebrow' },["Today's progress"]),
        el('div',{ class:'fred', style:'font-weight:700;font-size:30px;line-height:1.15;margin-top:4px' },[statusText]),
        el('div',{ style:'font-size:15px;font-weight:700;color:#9C8E7F;margin-top:6px' },[doneN+' of '+totalN+' daily tasks checked off']),
        bonus>0 ? el('div',{ class:'gradg', style:'display:inline-flex;align-items:center;gap:8px;margin-top:14px;color:#3C5A45;font-weight:800;font-size:14px;padding:8px 16px;border-radius:999px' },['★ +'+bonus+'% bonus earned']) : null
      ])
    ]);

    return el('div',{},[ hero, el('div',{ class:'grid2' },[ tasksColumn(day), el('div',{ style:'display:flex;flex-direction:column;gap:24px' },[ wantsCard(day), calendar() ]) ]) ]);
  };
})();
</script>
```

- [ ] **Step 3: Verify in a browser**

Run: reload `index.html`.
Expected: ring shows the needs percentage; checking tasks raises it; at 100% the ring turns green-gold, confetti animates, and a bonus badge can appear by completing wants (counter goes past 100). Add an ad-hoc task (counts toward %, removable). Add/remove/toggle wants. The calendar shows the month with today outlined; a perfect day turns coral. Checking "Today's drum workout" works. Verify no console errors and state persists on reload.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: build Today screen with ring, tasks, wants, calendar, confetti"
```

---

## Task 9: index.html — Drums screen (workout, streak, stage path) + metronome + timer

**Files:**
- Modify: `index.html` (add Drums CSS, a metronome/timer `<script>`, and a `window.renderDrums` `<script>` before the bootstrap script).

**Interfaces:**
- Consumes: `window.App`, `window.el`, `window.Logic`, `window.CURRICULUM`.
- Produces: `window.renderDrums() -> HTMLElement`, `window.Metronome` (`{toggle, setBpm, isRunning, bpm}`), `window.Timer` (`{toggle, reset, running, elapsedMs}`). The metronome and timer keep their own state across re-renders (singletons created once).

- [ ] **Step 1: Add Drums CSS** to `<style>`

```css
  @keyframes hdBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  @keyframes beatPulse{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.9);opacity:0}}
  .drumwrap{max-width:880px;margin:0 auto}
  .ex{border-radius:18px;padding:16px 18px;margin-bottom:10px}
  .tool{background:#FFFDF8;border:1.5px solid #EBDECB;border-radius:20px;padding:18px}
  .pill{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:800}
  .roundbtn{border:none;border-radius:14px;cursor:pointer;font-weight:700;font-size:15px;padding:11px 18px;color:#fff}
  @media (max-width:720px){ .drumtools{grid-template-columns:1fr !important} }
```

- [ ] **Step 2: Add the metronome + timer script** (before the bootstrap script)

```html
<script>
(function(){
  // ---- Web Audio metronome with look-ahead scheduling ----
  var ctx = null, nextNoteTime = 0, beat = 0, timerId = null;
  var Metro = window.Metronome = { bpm: 80, running: false, onBeat: null };
  function scheduleClick(time, accent){
    var osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.frequency.value = accent ? 1500 : 1000;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.6 : 0.35, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(time); osc.stop(time + 0.06);
  }
  function scheduler(){
    while (nextNoteTime < ctx.currentTime + 0.1){
      var accent = (beat % 4) === 0;
      scheduleClick(nextNoteTime, accent);
      var when = nextNoteTime, b = beat;
      setTimeout(function(){ if (Metro.onBeat) Metro.onBeat(b % 4); }, Math.max(0,(when - ctx.currentTime))*1000);
      nextNoteTime += 60 / Metro.bpm;
      beat = (beat + 1) % 4;
    }
    timerId = setTimeout(scheduler, 25);
  }
  Metro.setBpm = function(v){ Metro.bpm = Math.max(40, Math.min(220, v|0)); App.state.settings.metronomeBpm = Metro.bpm; App.save(); };
  Metro.toggle = function(){
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (Metro.running){ Metro.running = false; clearTimeout(timerId); }
    else { Metro.running = true; beat = 0; nextNoteTime = ctx.currentTime + 0.05; scheduler(); }
  };

  // ---- Count-up practice timer ----
  var Timer = window.Timer = { running: false, elapsedMs: 0, _start: 0, _tick: null, onTick: null };
  Timer.toggle = function(){
    if (Timer.running){ Timer.running = false; Timer.elapsedMs += Date.now() - Timer._start; clearInterval(Timer._tick); }
    else { Timer.running = true; Timer._start = Date.now(); Timer._tick = setInterval(function(){ if (Timer.onTick) Timer.onTick(); }, 250); }
  };
  Timer.reset = function(){ Timer.running = false; Timer.elapsedMs = 0; clearInterval(Timer._tick); if (Timer.onTick) Timer.onTick(); };
  Timer.display = function(){ var ms = Timer.elapsedMs + (Timer.running ? Date.now()-Timer._start : 0); var s = Math.floor(ms/1000); return (Math.floor(s/60)) + ':' + (s%60<10?'0':'') + (s%60); };
})();
</script>
```

- [ ] **Step 3: Add the Drums render script** (before the bootstrap script)

```html
<script>
(function(){
  var L = window.Logic, CUR = window.CURRICULUM, el = window.el;

  function metronomeTool(){
    var Metro = window.Metronome; if (!Metro.bpm) Metro.bpm = App.state.settings.metronomeBpm || 80;
    var bpmLabel = el('div',{ class:'fred', style:'font-weight:700;font-size:40px;line-height:1' },[String(Metro.bpm)]);
    var dot = el('div',{ style:'position:relative;width:46px;height:46px;border-radius:50%;border:3px solid #F2C9A8;display:flex;align-items:center;justify-content:center' });
    var pulse = el('div',{ style:'position:absolute;inset:0;border-radius:50%;background:#F2A07B;opacity:0' });
    dot.appendChild(pulse);
    Metro.onBeat = function(b){ pulse.style.animation='none'; void pulse.offsetWidth; pulse.style.background = b===0 ? '#F2A07B' : '#F6C56B'; pulse.style.animation='beatPulse .25s ease-out'; };
    function setBpm(v){ Metro.setBpm(v); bpmLabel.textContent = String(Metro.bpm); }
    var startBtn = el('button',{ class:'roundbtn grad', onClick:function(){ Metro.toggle(); startBtn.textContent = Metro.running?'Stop':'Start'; } },[Metro.running?'Stop':'Start']);
    return el('div',{ class:'tool' },[
      el('div',{ class:'eyebrow', style:'margin-bottom:10px' },['Metronome']),
      el('div',{ style:'display:flex;align-items:center;gap:16px' },[ bpmLabel, el('div',{ style:'font-weight:700;color:#9C8E7F' },['BPM']), dot ]),
      el('input',{ type:'range', min:'40', max:'220', value:String(Metro.bpm), style:'width:100%;margin:14px 0', onInput:function(e){ setBpm(+e.target.value); } }),
      el('div',{ style:'display:flex;gap:8px' },[
        el('button',{ class:'roundbtn', style:'background:#F0E6D4;color:#7A6E62', onClick:function(){ setBpm(Metro.bpm-1); } },['−']),
        el('button',{ class:'roundbtn', style:'background:#F0E6D4;color:#7A6E62', onClick:function(){ setBpm(Metro.bpm+1); } },['+']),
        startBtn
      ])
    ]);
  }

  function timerTool(){
    var T = window.Timer;
    var disp = el('div',{ class:'fred', style:'font-weight:700;font-size:40px;line-height:1' },[T.display()]);
    T.onTick = function(){ disp.textContent = T.display(); };
    var startBtn = el('button',{ class:'roundbtn grad', onClick:function(){ T.toggle(); startBtn.textContent = T.running?'Pause':'Start'; } },[T.running?'Pause':'Start']);
    return el('div',{ class:'tool' },[
      el('div',{ class:'eyebrow', style:'margin-bottom:10px' },['Practice timer']),
      disp,
      el('div',{ style:'display:flex;gap:8px;margin-top:14px' },[ startBtn, el('button',{ class:'roundbtn', style:'background:#F0E6D4;color:#7A6E62', onClick:function(){ T.reset(); startBtn.textContent='Start'; } },['Reset']) ])
    ]);
  }

  function exerciseCard(day, ex){
    var done = day.drum.exercises[ex.id] === true;
    var tempo = L.exerciseTempo(App.state.drumProgress.tempos, ex);
    var target = [];
    if (tempo != null) target.push(tempo + ' BPM');
    if (ex.durationMin) target.push(ex.durationMin + ' min');
    if (ex.reps) target.push(ex.reps + ' reps');
    var demo = ex.demoUrl || ('https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.name + ' drum lesson'));
    return el('div',{ class:'ex', style: done ? 'background:linear-gradient(135deg,#EEF8F1,#FBF4E2);border:1.5px solid #C5E6D1' : 'background:#fff;border:1.5px solid #EFE5D4;box-shadow:0 6px 16px -12px rgba(120,80,40,.4)' },[
      el('div',{ style:'display:flex;align-items:flex-start;gap:14px' },[
        el('div',{ class: done?'ck gradg':'', style:'width:28px;height:28px;border-radius:50%;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;'+(done?'color:#fff;font-weight:900':'border:2.5px solid #E7B894'), html: done?'✓':'', onClick:function(){ App.set(L.toggleExercise(App.state, App.today(), ex.id, CUR)); } }),
        el('div',{ style:'flex:1' },[
          el('div',{ class:'fred', style:'font-weight:600;font-size:17px;color:'+(done?'#3E5A47':'#4B4139') },[ex.name]),
          el('div',{ style:'font-size:14px;font-weight:600;color:#8A7B6B;margin-top:4px' },[ex.instructions]),
          el('div',{ style:'display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:10px' },[
            target.length ? el('span',{ class:'pill', style:'background:#FBEEE2;color:#C2855B' },['Goal · '+target.join(' · ')]) : null,
            el('a',{ href:demo, target:'_blank', rel:'noopener', style:'font-weight:800;font-size:13px;color:#C2855B;text-decoration:none' },['▶ Watch demo'])
          ])
        ])
      ])
    ]);
  }

  function stagePath(){
    var dp = App.state.drumProgress, cc = dp.stageIndex;
    var path = CUR.map(function(st, i){
      var done = i < cc, current = i === cc;
      var dotStyle = done ? 'background:linear-gradient(135deg,#6FBF93,#9FD3B4);color:#fff'
        : current ? 'background:linear-gradient(135deg,#F2A07B,#F6C56B);color:#fff;box-shadow:0 0 0 5px rgba(242,160,123,.22)'
        : 'background:#EDE3D3;color:#BFAE99';
      return el('div',{ style:'display:flex;gap:14px' },[
        el('div',{ style:'display:flex;flex-direction:column;align-items:center;width:38px;flex-shrink:0' },[
          el('div',{ style:'width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;'+dotStyle, html: done?'✓':(current?String(i+1):'🔒') }),
          i < CUR.length-1 ? el('div',{ style:'width:3px;flex:1;min-height:26px;background:#EBDFCD;border-radius:2px;margin:6px 0' }) : null
        ]),
        el('div',{ style:'flex:1;padding-bottom:14px;opacity:'+(i>cc?'.7':'1') },[
          el('div',{ class:'fred', style:'font-weight:600;font-size:17px;color:'+(i>cc?'#A99A86':'#4B4139') },[st.title + (current?' · now':'')]),
          el('div',{ style:'font-size:13px;font-weight:600;color:#9C8E7F;margin-top:2px' },[st.desc])
        ])
      ]);
    });
    return el('div',{ class:'card', style:'padding:20px 18px;margin-top:22px' },[ el('div',{ class:'eyebrow', style:'margin-bottom:14px' },['Your journey']) ].concat(path));
  }

  window.renderDrums = function(){
    var day = App.state.history[App.today()];
    var dp = App.state.drumProgress, stage = L.currentStage(CUR, dp.stageIndex);
    var streak = L.computeStreak(App.state.history, App.today());
    var complete = day.drum.completed;

    var header = el('div',{ class:'card', style:'padding:22px 26px;background:linear-gradient(120deg,#FFFFFF,#FFF5EA)' },[
      el('div',{ style:'display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap' },[
        el('div',{},[
          el('div',{ class:'eyebrow' },['Stage '+(dp.stageIndex+1)+' of '+CUR.length+(complete?' · done today':'')]),
          el('div',{ class:'fred', style:'font-weight:700;font-size:26px;margin-top:2px' },[stage.title])
        ]),
        el('div',{ style:'text-align:center' },[
          el('div',{ class:'fred grad', style:'font-weight:700;font-size:34px;-webkit-background-clip:text;background-clip:text;color:transparent' },['🔥 '+streak]),
          el('div',{ class:'eyebrow' },['day streak'])
        ])
      ])
    ]);

    var tools = el('div',{ class:'drumtools', style:'display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px' },[ metronomeTool(), timerTool() ]);

    var workout = el('div',{ style:'margin-top:18px' },[
      el('div',{ class:'fred', style:'font-weight:600;font-size:21px;margin:0 2px 12px' },["Today's workout"]) ]
      .concat(stage.exercises.map(function(ex){ return exerciseCard(day, ex); })));

    return el('div',{ class:'drumwrap' },[ header, tools, workout, stagePath() ]);
  };
})();
</script>
```

- [ ] **Step 4: Verify in a browser**

Run: reload `index.html`, go to Drums.
Expected: the metronome plays an audible click (accented downbeat) with a visual pulse, BPM adjusts via slider/+/−, and last BPM persists. The timer counts up / pauses / resets. Each exercise toggles complete; completing all marks the workout done, bumps the streak, and checks "Today's drum workout" back on the Today screen (and vice versa). The stage path shows current/locked/done. Confirm tempo on an exercise increases after completing the workout (reload and re-check the displayed BPM). No console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: build Drums screen with metronome, timer, workout, streak, stage path"
```

---

## Task 10: README, CHANGELOG, GitHub Pages

**Files:**
- Create: `README.md`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Jason Daily

A self-contained personal habit tracker + daily drum-workout web app. No backend,
no accounts. All data lives in your browser's localStorage; use the in-app
Export / Import buttons to back it up to a file.

## Run it
Open `index.html` in any modern browser, or visit the GitHub Pages URL.

## Edit the drum curriculum
All exercises live in `workout-curriculum.js` as a clearly structured array of
six stages. Replace names, instructions, `startBpm`/`maxBpm`, `durationMin`,
`reps`, and optional `demoUrl` — no other file needs to change. Keep each
exercise `id` unique.

## Tune behavior
`logic.js` `DEFAULT_SETTINGS`: `tempoIncrement` (BPM added per completed day),
`bonusPerWant` (% each want adds past 100), `metronomeBpm` (default tempo).
Per-stage `daysToAdvance` lives in the curriculum.

## Tests
`npm test` runs the `node:test` suite for `logic.js` and the curriculum.

## Backup
Export writes a JSON snapshot; Import replaces all data from such a file.
```

- [ ] **Step 2: Create `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-06-25
### Added
- Today screen: needs completion ring, bonus wants past 100%, ad-hoc tasks,
  monthly perfect-day calendar, confetti on 100%.
- Drums screen: daily workout from a 6-stage curriculum, working Web Audio
  metronome, count-up practice timer, drumming streak, tempo progression, and
  a stage-progression path.
- Shared "Today's drum workout" state between both screens.
- localStorage persistence with file export/import backup.
- Pure logic in `logic.js` with `node:test` unit tests.
```

- [ ] **Step 3: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: add README and changelog"
```

- [ ] **Step 4: Push and open a PR**

```bash
git push -u origin feature/habit-drum-game
gh pr create --title "Habit Drum Game" --body "Self-contained habit tracker + daily drum workout. See docs/specs/habit-drum-game-design.md." --base main
```

- [ ] **Step 5: After merge, enable GitHub Pages**

Enable Pages on `main` (root) via repo settings or:
```bash
gh api -X POST repos/jasonsanje/Jason-Daily/pages -f "source[branch]=main" -f "source[path]=/" 2>/dev/null || echo "Enable Pages in repo Settings > Pages (Branch: main, /root)."
```
Expected: the app is reachable at `https://jasonsanje.github.io/Jason-Daily/`.

---

## Self-Review

- **Spec coverage:** Today ring/needs (Task 8), bonus wants past 100 (8), ad-hoc tasks (8), default needs re-seed daily (2/7), perfect-day calendar (8), confetti (8), drum daily workout + exercises (9), metronome (9), timer (9), streak (9), tempo progression (5/9), stage curriculum + advancement (1/5/9), shared drum/needs state (5/8/9), localStorage + export/import (6/7), mobile responsive (7/8/9), testable pure logic (2–6). All covered.
- **Placeholder scan:** No TBD/TODO; all code blocks are complete and runnable.
- **Type consistency:** `setWorkoutComplete`, `toggleExercise`, `toggleWant`, `addAdhocNeed`, `removeNeed`, `addWant`, `removeWant`, `updateDay`, `ensureDay`, `computeNeedsPct`, `counterValue`, `computeStreak`, `exerciseTempo`, `currentStage`, `deserialize`/`serialize`/`migrate` names match across logic tasks and the UI tasks that call them. The `Day.drum` shape (`completed`,`counted`,`exercises`) is consistent in Tasks 2, 5, 8, 9.
```
