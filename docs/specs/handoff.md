# Habit Drum Game — Session Handoff

**Last updated:** 2026-06-25
**Branch:** `feature/habit-drum-game`
**Repo:** `jasonsanje/Jason-Daily`

## What We Built

A self-contained, single-page personal habit tracker + daily drum-workout web app. No backend, no accounts. All data in `localStorage`, with file export/import for backup. To be hosted on GitHub Pages.

## Key Files

| File | Purpose |
|------|---------|
| `docs/specs/habit-drum-game-design.md` | Approved design document |
| `docs/specs/habit-drum-game-plan.md` | Full implementation plan (10 tasks) |
| `docs/specs/handoff.md` | This file |
| `.superpowers/sdd/progress.md` | SDD ledger (task completion tracking) |

## Execution Method

Subagent-Driven Development (SDD):
- Fresh subagent per task
- Task reviewer after each
- User asked before each task begins
- Ledger updated at `.superpowers/sdd/progress.md`

## Task Progress

| # | Task | Status | Commits |
|---|------|--------|---------|
| 1 | Scaffolding, package.json, curriculum data | ⏳ pending | — |
| 2 | logic.js — dates, initial state, seeding | ⏳ pending | — |
| 3 | logic.js — reads (percent, bonus, perfect day, streak) | ⏳ pending | — |
| 4 | logic.js — needs/wants/adhoc transitions | ⏳ pending | — |
| 5 | logic.js — drum workout transitions, tempo, stages | ⏳ pending | — |
| 6 | logic.js — serialize / deserialize / migrate | ⏳ pending | — |
| 7 | index.html — shell, CSS, storage, router, top bar | ⏳ pending | — |
| 8 | index.html — Today screen | ⏳ pending | — |
| 9 | index.html — Drums screen + metronome + timer | ⏳ pending | — |
| 10 | README, CHANGELOG, GitHub Pages | ⏳ pending | — |

## Architecture Summary

```
logic.js              ← pure functions (no DOM, no storage) — unit-tested in Node
workout-curriculum.js ← 6-stage drum curriculum (easy to replace)
index.html            ← all CSS + DOM + Web Audio metronome + timer + confetti
test/logic.test.js    ← node:test suite, zero dependencies
```

Single `localStorage` key: `jasonDaily.v1`. Date keys are local-time `YYYY-MM-DD`. Default needs: Devotion, Eat breakfast, Take a bath, Eat lunch, Hatid luvie, Sundo luvie, Today's drum workout (links to Drums page).

## Notes for Resuming

- Always check `.superpowers/sdd/progress.md` and `git log` before resuming — the ledger is the source of truth.
- The user wants to be asked before each task starts.
- Execution is on `feature/habit-drum-game`; push + PR + GitHub Pages happen in Task 10.
