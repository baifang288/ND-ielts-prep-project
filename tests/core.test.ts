import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAnswer, countWords } from "../lib/check.ts";
import { nextReview } from "../lib/srs.ts";
import { addDays, daysBetween, isValidISODate, startOfWeek } from "../lib/dates.ts";
import { approxBandFromRaw, overallBand, rawNeededFor } from "../lib/scoring.ts";

test("answer checking", () => {
  assert.equal(checkAnswer("  Library ", ["library"]), "correct");
  assert.equal(checkAnswer("the library", ["library"]), "correct");
  assert.equal(checkAnswer("libary", ["library"]), "spelling");
  assert.equal(checkAnswer("park", ["library"]), "wrong");
  assert.equal(checkAnswer("", ["library"]), "blank");
  assert.equal(checkAnswer("Not Given", ["Not Given"]), "correct");
});

test("word count ignores stray punctuation", () => {
  assert.equal(countWords("I like tea - and coffee."), 5);
  assert.equal(countWords("   "), 0);
});

test("spaced repetition", () => {
  assert.deepEqual(nextReview(0, "easy"), { stage: 1, days: 3 });
  assert.deepEqual(nextReview(2, "forgotten"), { stage: 0, days: 1 });
  assert.deepEqual(nextReview(3, "difficult"), { stage: 3, days: 7 });
  assert.deepEqual(nextReview(4, "easy"), { stage: 4, days: 30 });
});

test("dates", () => {
  assert.equal(addDays("2026-11-09", 27), "2026-12-06");
  assert.equal(daysBetween("2026-11-09", "2027-08-01"), 265);
  assert.equal(startOfWeek("2026-11-15"), "2026-11-09");
  assert.equal(isValidISODate("2027-02-30"), false);
});

test("band guidance", () => {
  assert.equal(approxBandFromRaw("listening", 26), 6.5);
  assert.equal(approxBandFromRaw("reading", 23), 6);
  assert.equal(approxBandFromRaw("reading", 5), null);
  assert.equal(rawNeededFor("reading", 6.5), 27);
  assert.equal(overallBand([6, 6.5, 6, 6.5]), 6.5);
  assert.equal(overallBand([6, 6, 6, 6.5]), 6);
  assert.equal(overallBand([6.5, 6.5, 6.5, 7]), 6.5); // mean 6.625
  assert.equal(overallBand([6.5, 7, 6.5, 7]), 7); // mean 6.75 rounds up
});
