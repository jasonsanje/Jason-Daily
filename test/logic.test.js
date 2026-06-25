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

// --- Task 5: drum workout transitions, tempo progression, stage advancement ---

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

// --- Task 6: serialize / deserialize / migrate ---

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
