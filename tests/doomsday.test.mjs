import assert from "node:assert/strict";
import {
  doomsdayCalculation,
  isLeapYear,
  randomDate,
  weekdayIndex,
} from "../public/doomsday.mjs";

assert.equal(isLeapYear(2000), true);
assert.equal(isLeapYear(1900), false);
assert.equal(isLeapYear(2024), true);
assert.equal(isLeapYear(2026), false);

const knownDates = [
  [1969, 7, 20, 0],
  [2000, 1, 1, 6],
  [2001, 9, 11, 2],
  [2024, 2, 29, 4],
  [2026, 9, 18, 5],
  [2099, 12, 31, 4],
];

for (const [year, month, day, expected] of knownDates) {
  assert.equal(weekdayIndex(year, month, day), expected);
  assert.equal(doomsdayCalculation(year, month, day).answer, expected);
}

for (let year = 1900; year <= 2099; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (const day of [1, Math.ceil(maxDay / 2), maxDay]) {
      const nativeWeekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      assert.equal(
        doomsdayCalculation(year, month, day).answer,
        nativeWeekday,
        `Mismatch for ${year}-${month}-${day}`,
      );
    }
  }
}

for (let i = 0; i < 500; i += 1) {
  const generated = randomDate();
  assert.ok(generated.year >= 1900 && generated.year <= 2099);
  assert.ok(generated.month >= 1 && generated.month <= 12);
  assert.ok(generated.day >= 1 && generated.day <= 31);
}

console.log("Doomsday calculation and date generation checks passed.");
