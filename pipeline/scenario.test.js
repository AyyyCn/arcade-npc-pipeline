import test from "node:test";
import assert from "node:assert/strict";
import { briefs, validateFacts } from "./briefs.js";
import { compileBrief, playBrief } from "./scenario.js";

test("a relocated gig connects attendance and archive discovery to the stage work order", () => {
  const scene = compileBrief(briefs[0].facts);
  const original = playBrief(scene),
    delayed = playBrief(scene, { delayMessenger: true }),
    blocked = playBrief(scene, { blockView: true });
  assert.deepEqual(scene.systems, ["social", "crew", "perception"]);
  assert.equal(original.attendance, 37);
  assert.equal(delayed.attendance, 10);
  assert.equal(original.zones, 2);
  assert.equal(delayed.zones, 1);
  assert.equal(original.search.visits.length, 1);
  assert.equal(blocked.search.visits.length, 2);
  assert.ok(blocked.search.end > original.search.end);
  assert.ok(
    blocked.stage.entries.find((e) => e.job.id === "sound").start >=
      blocked.search.end,
  );
  assert.ok(blocked.stage.end > original.stage.end);
});
test("a mystery only needs the archive and the booked hall skips the message chain", () => {
  const mystery = compileBrief(briefs[1].facts),
    booked = compileBrief(briefs[2].facts);
  assert.deepEqual(mystery.systems, ["perception"]);
  assert.equal(playBrief(mystery).stage, null);
  assert.equal(booked.forecast, null);
  assert.deepEqual(booked.systems, ["crew", "perception"]);
  assert.equal(playBrief(booked).attendance, 40);
  assert.throws(() => validateFacts({ goal: "find_record", venue: "moved" }));
});
