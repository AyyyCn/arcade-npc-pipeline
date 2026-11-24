import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { FORK, HOLD, COUNT, END } from "../comparison/simulation.js";
import { DOORS } from "../crew/scenario.js";
import {
  buildNight,
  summary,
  tellResult,
  personByName,
  LOADIN,
  staff,
} from "./world.js";
import { survey, choose, RESCUE_AT } from "./director.js";
import { answer, audit, records } from "./mind.js";
import { read, validate, interpret } from "./language.js";

const id = (name) => personByName(name).index;
const hold = (name) => ({ id: id(name), from: FORK, to: FORK + HOLD });

test("an untouched night fills East Hall and opens before doors", () => {
  const night = buildNight();
  assert.equal(night.attendance, 37);
  assert.equal(night.zones, 2);
  assert.ok(night.onTime && night.saved);
  assert.deepEqual(buildNight(), night, "the same seed replays the same night");
});

test("one missed conversation sends staff to the wrong hall and the stage runs late", () => {
  const night = buildNight({ holds: [hold("ada")] });
  assert.equal(night.attendance, 10);
  assert.equal(night.zones, 1);
  assert.deepEqual(
    night.team.filter((s) => s.late > 0).map((s) => s.name),
    staff.map((s) => s.name),
  );
  assert.ok(!night.onTime);
  // Nobody works before they have physically arrived.
  for (const s of night.team.filter((s) => s.crew >= 0))
    for (const part of night.plan.tracks[s.crew])
      if (part.kind === "work") assert.ok(part.start >= s.late);
  // Sound waits for Ida, who was late to the archive herself.
  const sound = night.plan.entries.find((e) => e.job.id === "sound");
  assert.ok(LOADIN + sound.start >= night.recordReady);
});

test("one sentence to the right guest saves the same night", () => {
  const tells = [{ id: id("otto"), tick: RESCUE_AT }];
  const night = buildNight({ holds: [hold("ada")], tells });
  assert.ok(night.saved);
  assert.ok(night.attendance >= 30);
  const result = tellResult(night, tells[0]);
  assert.ok(result.accepted && result.reached > 5);
  // Telling someone who already knows writes no receipt.
  const wasted = { id: night.crowd.manager, tick: RESCUE_AT };
  const same = buildNight({ holds: [hold("ada")], tells: [wasted] });
  assert.equal(tellResult(same, wasted).accepted, false);
  assert.equal(same.attendance, 10);
});

test("characters answer from their own records, including beliefs that are wrong", () => {
  const night = buildNight({ holds: [hold("ada")], screen: "closed" });
  const nina = id("nina");
  assert.match(answer(night, nina, 200, "venue").text, /^West Hall/);
  assert.match(answer(night, nina, 430, "doing").text, /West Hall/);
  assert.equal(records(night, nina, 430).believes, -1);
  // She learns later, and can say how.
  assert.match(answer(night, nina, 520, "venue").text, /^East Hall.*West Hall first/);
  // The stage manager counted the room. A stagehand only has the work order.
  assert.match(answer(night, nina, 600, "crowd").text, /counted 10/);
  assert.doesNotMatch(answer(night, id("wes"), 600, "crowd").text, /\d/);
  // Guests have no record of the reference sleeve.
  assert.equal(answer(night, id("kit"), 600, "record").knows, false);
  // With the screen shut, Ida reasons from what she could see and names no certainty.
  const searching = answer(night, id("ida"), night.searchStart + 40, "record");
  assert.match(searching.text, /didn’t see where it went/);
  assert.doesNotMatch(searching.text, /found the sleeve/);
  assert.match(answer(night, id("ida"), night.recordReady + 1, "record").text, /found the sleeve in Dispatch/);
  // Sight is remembered, and absence of sight is admitted.
  const seen = answer(night, id("kit"), 300, "whereis", id("ada"));
  assert.match(seen.text, /last saw Ada/);
  assert.equal(answer(night, id("ida"), night.searchStart + 30, "whereis", id("tess")).text.includes("can see"), false);
});

test("a radio call hands the job over and the crew can say why", () => {
  const base = buildNight();
  const rack = base.plan.entries.find((e) => e.job.id === "rack");
  const at = rack.start + 20,
    member = rack.team[0];
  const night = buildNight({ call: { member, at, ticks: 120 } });
  assert.equal(night.callError, null);
  const away = staff.find((s) => s.crew === member);
  assert.match(answer(night, away.id, LOADIN + at + 10, "doing").text, /radio call/);
  const cover = night.plan.entries.find(
    (e) => e.job.id === "rack" && !e.interrupted && e.start >= at,
  );
  const helper = staff.find((s) => cover.team.includes(s.crew) && s.crew !== rack.team[1] && s.crew !== member);
  if (helper)
    assert.match(
      answer(night, helper.id, LOADIN + cover.start + 5, "doing").text,
      /took it over when/,
    );
});

test("no answer names a hall, person or bin the speaker has no record of", () => {
  for (const options of [
    {},
    { holds: [hold("ada")], screen: "closed" },
    { holds: [hold("aya")], tells: [{ id: id("kit"), tick: RESCUE_AT }] },
  ]) {
    const report = audit(buildNight(options), 25);
    assert.ok(report.answers > 5000);
    assert.ok(report.declined > 100);
    assert.deepEqual(report.failures, []);
  }
});

test("the director only causes trouble the player can still fix", async () => {
  const report = await survey(133);
  assert.equal(report.options.length, COUNT);
  assert.equal(choose(report, "quiet").hold, null);
  for (const mood of ["tense", "knife"]) {
    const pick = choose(report, mood);
    const holds = [pick.hold];
    assert.ok(!buildNight({ holds, screen: pick.screen }).saved, "left alone the night is lost");
    assert.ok(pick.rescues.length >= 1);
    for (const guest of pick.rescues)
      assert.ok(
        buildNight({ holds, screen: pick.screen, tells: [{ id: guest, tick: RESCUE_AT }] }).saved,
        "every promised way out works",
      );
  }
  const tense = choose(report, "tense"),
    knife = choose(report, "knife");
  assert.ok(knife.rescues.length <= tense.rescues.length);
  assert.ok(END > RESCUE_AT && DOORS > 0);
});

test("free text becomes one checked instruction", () => {
  const kit = id("kit");
  assert.deepEqual(read("Ada, who told you about the move?"), { act: "ask", who: id("ada"), topic: "source", about: null, correct: false });
  assert.equal(read("have you seen Nina?", kit).about, id("nina"));
  assert.equal(read("Otto, the gig is in East Hall now.").act, "tell");
  assert.deepEqual(read("Actually, tell Vera instead"), { act: "tell", who: id("vera"), correct: true });
  assert.equal(read("radio Wes").act, "call");
  assert.equal(read("open the archive screen").state, "open");
  assert.equal(read("what's the best pizza?", kit).topic, "other");
  assert.equal(read("hello").act, "none");
  assert.throws(() => validate({ act: "teleport", who: 1 }));
  assert.throws(() => validate({ act: "call", who: kit }), /radios/);
  assert.equal(validate({ act: "ask", who: kit, topic: "whereis", about: 99 }).topic, "other");
});

test("a local model's reading is constrained to the same instruction", async () => {
  const seen = [];
  // A stand-in for the model: it answers each constrained question with one allowed word.
  const server = http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const request = JSON.parse(body);
    seen.push(request);
    const word = request.grammar.includes('"tell"')
      ? request.messages.at(-1).content.includes("radio")
        ? "call"
        : "ask"
      : "whereis";
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ choices: [{ message: { content: word } }] }));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  try {
    const url = "http://127.0.0.1:" + server.address().port;
    // The model picks the kind of sentence. The names come from the cast list.
    assert.deepEqual(await interpret("is Nina around?", id("kit"), url), {
      act: "ask",
      who: id("kit"),
      topic: "whereis",
      about: id("nina"),
      correct: false,
    });
    assert.match(seen[0].grammar, /^root ::= "ask" \| "tell" \| "call" \| "screen"$/);
    assert.equal(seen[0].temperature, 0);
    // Only crew carry radios, whatever the model says.
    assert.equal((await interpret("Kit, get on the radio", null, url)).act, "ask");
    assert.equal((await interpret("Wes, get on the radio", null, url)).act, "call");
  } finally {
    server.close();
  }
});
