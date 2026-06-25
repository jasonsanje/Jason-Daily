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
