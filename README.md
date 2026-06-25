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
