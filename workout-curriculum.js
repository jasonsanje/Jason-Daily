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
