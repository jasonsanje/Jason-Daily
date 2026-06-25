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

  const api = {
    KEY, DEFAULT_NEEDS, DEFAULT_SETTINGS,
    dateKey, parseKey, addDays, todayKey,
    createInitialState, currentStage, seedDay, ensureDay,
    doneNeedsCount, totalNeeds, computeNeedsPct, bonusCount, computeBonus, counterValue, isPerfectDay, computeStreak,
    updateDay, toggleWant, addAdhocNeed, removeNeed, addWant, removeWant,
    exerciseTempo, isWorkoutComplete, nextTempo, setWorkoutComplete, toggleExercise,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof window !== 'undefined' ? window : this);
