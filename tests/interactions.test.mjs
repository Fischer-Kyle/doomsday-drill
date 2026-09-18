import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEFAULT_STATS, accuracyPercent, recordAttempt } from "../public/practice.mjs";

const root = new URL("../public/", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const app = await readFile(new URL("app.mjs", root), "utf8");

const weekdayButtons = [...html.matchAll(/data-day="(\d)"/g)].map((match) => Number(match[1]));
assert.deepEqual(weekdayButtons, [0, 1, 2, 3, 4, 5, 6]);
assert.match(app, /grid\.addEventListener\("click"/);
assert.match(app, /nextButton\.addEventListener\("click", newRound\)/);
assert.match(app, /document\.addEventListener\("keydown"/);
assert.match(app, /localStorage\.setItem/);
assert.match(app, /elements\.explainMisses\.checked/);

let stats = { ...DEFAULT_STATS };
stats = recordAttempt(stats, true);
stats = recordAttempt(stats, true);
assert.deepEqual(stats, { attempted: 2, correct: 2, currentStreak: 2, bestStreak: 2 });
assert.equal(accuracyPercent(stats), 100);

stats = recordAttempt(stats, false);
assert.deepEqual(stats, { attempted: 3, correct: 2, currentStreak: 0, bestStreak: 2 });
assert.equal(accuracyPercent(stats), 67);

stats = recordAttempt(stats, true);
assert.deepEqual(stats, { attempted: 4, correct: 3, currentStreak: 1, bestStreak: 2 });
assert.equal(accuracyPercent(stats), 75);

console.log("Answer, next-date, keyboard, settings, and scoring contracts passed.");
