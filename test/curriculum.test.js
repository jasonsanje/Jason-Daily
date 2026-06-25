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
