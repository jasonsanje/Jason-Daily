# Habit Drum Game — Design Document

**Date:** 2026-06-25
**Status:** Approved (brainstorming complete)
**Owner:** jason.sanje@gmail.com
**Design reference:** claude.ai/design project `ecc121ac-9d05-4da1-9019-74246f1f0bab` ("Habit Tracker Drum Game UI")

## 1. Summary

A self-contained, single-page personal web app (no backend, no accounts) that
combines a **daily habit tracker** with a **daily drum-practice workout**. All
data persists in browser `localStorage`, with export-to-file and
import-from-file for backup. The look is playful, colorful, and game-like, taken
from the imported Claude Design mockup. The app must be mobile-friendly.

Two screens, switched by a top-bar nav:

1. **Today** — a completion ring driven by "need" tasks, a bonus section for
   "want" tasks, and a monthly calendar of "perfect days."
2. **Drums** — a repeatable daily workout with a working metronome, a practice
   timer, a drumming streak, tempo progression, and a 6-stage curriculum path.

The "Today's drum workout" task on the Today screen and the workout completion
on the Drums screen are the **same shared state**.

## 2. Goals & non-goals

**Goals**
- Track daily "need" tasks toward a 100% completion ring; "want" tasks add bonus
  past 100% and never reduce the score.
- Re-seed default needs and wants fresh every day; keep per-day history.
- Mark perfect days (100% of needs) on a monthly calendar.
- Provide a real, working metronome and practice timer on the Drums screen.
- Track a drumming streak and progress target tempos over time.
- Ship a comprehensive default drum curriculum that is trivially replaceable.
- Persist everything in `localStorage`; support file export/import for backup.

**Non-goals**
- No backend, accounts, sync, or network calls (fonts via Google Fonts CDN are
  the only external resource; the app degrades gracefully to system fonts).
- No build step, no framework, no package dependencies at runtime.
- No audio asset files (the metronome click is synthesized with Web Audio).

## 3. Architecture & files

Static, dependency-free. Pure logic is separated from the DOM so it can be
unit-tested in Node with the built-in test runner — the only structural
deviation from a literal single file, and the app still runs with no build.

| File | Responsibility |
|------|----------------|
| `index.html` | App shell: all CSS, DOM rendering, event binding, Web Audio metronome, practice timer, confetti animation. Loads the two JS files below. Runs offline by opening the file. |
| `logic.js` | Pure functions, no DOM and no storage access. Date keying, daily re-seed, percent/bonus math, perfect-day detection, streak computation, tempo progression, stage advancement, export/import serialization, schema migration. Exposed both as browser globals and via `module.exports` for Node tests. |
| `workout-curriculum.js` | The curriculum data array (stages + exercises). The drop-in file to later replace with real exercises. |
| `test/logic.test.js` | `node:test` unit tests for `logic.js`. Zero dependencies. |
| `README.md` | How to run, host, edit the curriculum, and back up data. |
| `CHANGELOG.md` | Keep a Changelog + SemVer. |
| `.gitignore` | Standard ignores (OS files, editor cruft). |
| `docs/specs/habit-drum-game-design.md` | This document. |

**Hosting:** committed to the `jasonsanje/Jason-Daily` repo with **GitHub Pages**
enabled, giving a bookmarkable URL. Data still lives only in the browser.

## 4. Data model

Single `localStorage` key: `jasonDaily.v1`.

```jsonc
{
  "version": 1,
  "history": {
    "2026-06-25": {
      "needs": [
        { "id": "devotion", "label": "Devotion", "done": false, "source": "default" },
        { "id": "drum",     "label": "Today's drum workout", "done": false, "source": "default", "link": "drum" },
        { "id": "adhoc-...","label": "Call mom", "done": false, "source": "adhoc" }
      ],
      "wants": [
        { "id": "basketball", "label": "Play basketball", "done": false }
      ],
      "drum": {
        "completed": false,
        "exercises": { "s1-singles": false, "s1-doubles": false }
      }
    }
  },
  "wantsList": ["Play basketball"],
  "drumProgress": {
    "stageIndex": 0,
    "daysInStage": 0,
    "tempos": { "s1-singles": 60, "s1-doubles": 60 }
  },
  "settings": { "tempoIncrement": 2, "bonusPerWant": 10, "metronomeBpm": 80 }
}
```

**Date keys** are local-time `YYYY-MM-DD`. A new day begins at local midnight.

**Daily re-seed** (on load, when `history[today]` is absent):
- `needs` = the fixed default needs list, all `done: false`.
- `wants` = one entry per `wantsList` label, all `done: false`.
- `drum` = `{ completed: false, exercises: {…all current-stage exercise ids → false} }`.
- Prior days in `history` are never mutated by re-seed.

**Default needs** (fixed in code, in this order):
Devotion, Eat breakfast, Take a bath, Eat lunch, Hatid luvie, Sundo luvie,
**Today's drum workout** (`link: "drum"`).

**Ad-hoc tasks** are appended to the current day's `needs` with
`source: "adhoc"`. They exist only for that day and count toward its 100%.

**Wants** master list (`wantsList`) is editable (add/remove). Edits change which
wants seed *future* days; the current day's `wants` array is updated in place
when the user edits so the bonus reflects immediately.

## 5. Today screen

- **Completion ring** reflects **needs only**: `doneNeeds / totalNeeds`. The arc
  fills to that percentage (capped at 100% visually). Reaching 100% triggers the
  confetti animation and the celebratory ring glow/gradient.
- **Counter label**: shows the needs percentage; once at 100%, shows
  `100 + (completedWants × bonusPerWant)`.
- **Bonus / wants**: each completed want adds `bonusPerWant%` (default 10) past
  100. The bonus counter only increases; it never reduces the core score.
  The wants list is editable inline and re-seeds daily.
- **Today's drum workout sync**: the `link: "drum"` need mirrors
  `history[today].drum.completed`.
  - Checking it on Today sets `drum.completed = true` and marks every current
    exercise done for the day.
  - Unchecking sets `drum.completed = false` and clears the day's exercise
    completions.
  - Completing all exercises on the Drums screen sets the need `done = true`
    (and vice versa). One source of truth.
- **Monthly calendar**: renders the current month. A day is **perfect** when it
  exists in `history`, has at least one need, and every need is `done`. Perfect
  days use the coral→gold gradient tile; today (if not perfect) uses the
  outlined tile; other days are plain.
- **Backup menu** (top bar): **Export** downloads the entire state object as a
  JSON file; **Import** reads a JSON file and replaces state after a basic shape
  validation, then re-renders.

## 6. Drums screen

- **Daily workout** = the current stage's exercises. Each exercise card shows:
  name, short instructions, a **target** (`bpm` and/or `durationMin` and/or
  `reps`), a **mark-complete** toggle, and an optional **watch demo** YouTube
  link. Completing all exercises marks the day's workout complete (shared with
  Today). The displayed target BPM is the user's progressed tempo from
  `drumProgress.tempos`, falling back to the exercise's `startBpm`.
- **Metronome** (real, Web Audio API): adjustable BPM (slider plus +/− buttons,
  range ~40–220), start/stop, a synthesized click with an **accented downbeat**
  (4/4), and a **visual beat pulse**. Uses look-ahead scheduling for stable
  timing. Last-used BPM persists in `settings.metronomeBpm`.
- **Practice timer**: a count-up stopwatch with start / pause / reset.
- **Streak**: the count of consecutive calendar days with a completed workout,
  anchored at today (or at yesterday if today is not yet done), shown
  prominently. Computed from `history`.
- **Tempo progression**: when the day's workout becomes complete, each exercise
  with a BPM target has its stored tempo increased by `settings.tempoIncrement`
  (default +2), capped at the exercise's `maxBpm`. This is applied once per day
  on first completion and is adjustable.
- **Stage path** (the mockup's journey visual): the 6 stages rendered as
  done / current / locked with a progress bar. **Advancement rule:** completing
  the current stage's workout on the stage's `daysToAdvance` count of distinct
  days increments `stageIndex` (and resets `daysInStage`). Default
  `daysToAdvance` ≈ 5 per stage, adjustable per stage in the curriculum file.
  Advancing changes which exercises seed future daily workouts.

### Default curriculum (seed, fully replaceable)

Six stages, each with real exercises (name, instructions, `startBpm`, `maxBpm`,
optional duration/reps, YouTube search link), spanning:

1. **Foundations** — grip, posture, single strokes.
2. **Counting & Timing** — quarter/eighth notes locked to the metronome.
3. **Basic Rock Beat** — kick/snare/hi-hat groove.
4. **Rudiments** — singles, doubles, paradiddles.
5. **Beat Variations & Fills** — groove variations and simple fills.
6. **Playing Along to Songs** — applying it to real tracks.

The curriculum lives entirely in `workout-curriculum.js` as a clearly
structured array, so the real exercises can be dropped in without touching app
logic.

## 7. Visual system

From the imported design:
- **Background**: warm cream (`#EFE5D4`, gradient `#FBF6EE → #F2E8D8`).
- **Primary / active**: coral→gold gradient (`#F2A07B → #F6C56B`).
- **Done / bonus**: green (`#6FBF93 → #9FD3B4`).
- **Fonts**: Fredoka (headings, playful) + Nunito (body), via Google Fonts with
  system-font fallback.
- Heavily rounded cards (12–30px), soft shadows, the animated drummer mascot,
  and in-app confetti (no external library).
- **Responsive**: the Today two-column layout and the ring hero stack vertically
  on phones; nav and all controls are touch-sized. A mobile breakpoint around
  720px.

## 8. Testing

TDD on the pure functions in `logic.js`:
- Re-seed produces a correct fresh day (defaults unchecked; wants from list;
  drum exercises for the current stage).
- Percent and bonus math, including the counter past 100%.
- Perfect-day detection (all needs done; empty/partial days are not perfect).
- Streak computation across gaps and the today/yesterday anchor.
- Tempo bump applies once, respects the cap, and uses `tempoIncrement`.
- Stage advancement at `daysToAdvance` and `stageIndex` clamping.
- Export → import round-trip and schema migration of unknown/old shapes.

Metronome timing, the timer, and rendering are verified manually (audio + DOM).

## 9. Edge cases

- **Midnight crossover** while open: re-seed is checked on load and on visibility
  regain; a day boundary creates a fresh `history[today]` without touching past
  days.
- **Import of malformed JSON**: validate top-level shape; on failure, keep
  current state and surface a non-destructive error.
- **Empty needs list**: ring shows 0% and the day is not "perfect."
- **Curriculum edited** (ids changed) after history exists: unknown exercise ids
  are ignored when reading old days; the current day re-seeds from the new
  curriculum.
- **Metronome on mobile**: Web Audio resumes on a user gesture (start button).

## 10. Repository & workflow

- Work on a feature branch (`feature/habit-drum-game`) per GitHub Flow; open a
  PR to `main` when ready.
- `CHANGELOG.md` updated with each commit/PR.
- GitHub Pages enabled from `main` after merge.
