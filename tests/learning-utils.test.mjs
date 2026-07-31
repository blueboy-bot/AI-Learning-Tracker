import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateStreak,
  getDatesInCurrentMonth,
  getElapsedSeconds,
  getLocalDateString,
  parseStoredJson,
} from "../lib/learning-utils.mjs";

test("uses the local calendar date instead of UTC", () => {
  const localEvening = new Date(2026, 6, 31, 21, 30);
  assert.equal(getLocalDateString(localEvening), "2026-07-31");
});

test("builds every day in the current month using local dates", () => {
  const dates = getDatesInCurrentMonth(new Date(2026, 1, 10, 12));
  assert.equal(dates.length, 28);
  assert.equal(dates[0], "2026-02-01");
  assert.equal(dates.at(-1), "2026-02-28");
});

test("counts a consecutive learning streak from today", () => {
  const entries = [
    { date: "2026-07-31" },
    { date: "2026-07-30" },
    { date: "2026-07-29" },
    { date: "2026-07-27" },
  ];
  assert.equal(calculateStreak(entries, new Date(2026, 6, 31, 12)), 3);
});

test("calculates elapsed timer time from timestamps", () => {
  assert.equal(getElapsedSeconds(120, 1_000, 11_500), 130);
  assert.equal(getElapsedSeconds(120, null, 11_500), 120);
});

test("falls back safely when stored JSON is invalid", () => {
  assert.deepEqual(parseStoredJson("{not json", []), []);
  assert.deepEqual(parseStoredJson('["01"]', []), ["01"]);
});
