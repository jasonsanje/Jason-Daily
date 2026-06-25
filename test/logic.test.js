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
