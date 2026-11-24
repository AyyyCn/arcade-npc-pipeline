import {
  END,
  HZ,
  COUNT,
  hall,
  history,
  readGuest,
  lineOfSight,
  PROGRAMME,
  RADIO,
  PLAYER,
} from "../comparison/simulation.js";
import { crew, DOORS } from "../crew/scenario.js";
import { memberState, jobAt } from "../crew/planner.js";
import { searchState, stations, PLACEMENT } from "../perception/search.js";
import { people } from "../npc/people.js";
import { LOADIN, staffById } from "./world.js";

// A character answers from their own records and nothing else. `records` gathers what one person
// holds at one moment. `answer` turns a topic into a sentence using only those records.
export const topics = [
  "venue",
  "source",
  "told",
  "doing",
  "record",
  "crowd",
  "whereis",
];
const SIGHT = 7;
const stamp = (t) => (t / HZ).toFixed(1) + " s";
const hallName = (h) => (h === 1 ? "East Hall" : h === -1 ? "West Hall" : "the foyer");
const list = (names) =>
  names.length < 2
    ? names.join("")
    : names.slice(0, -1).join(", ") + " and " + names.at(-1);
const name = (id) => people[id].name;

function member(night, id) {
  return night.team.find((s) => s.id === id) ?? null;
}
function arrived(night, id, t) {
  const s = member(night, id);
  return Boolean(s) && t >= LOADIN + s.late;
}
// Where a person physically is on the night clock.
export function whereabouts(night, id, t) {
  const s = member(night, id);
  if (s && t >= LOADIN) {
    if (t < LOADIN + s.late) return { room: "crossing" };
    return { room: s.crew >= 0 ? "stage" : "archive" };
  }
  const p = readGuest(night.crowd, Math.min(t, END), id);
  return { room: "floor", x: p.x, z: p.z, hall: hall(p.x), speed: p.speed };
}
function sees(night, a, b, t) {
  const p = whereabouts(night, a, t),
    q = whereabouts(night, b, t);
  if (p.room === "crossing" || q.room === "crossing") return false;
  if (p.room === "archive" || q.room === "archive") return false;
  if (p.room === "stage" && q.room === "stage") return true;
  // The stage is in East Hall, so the audience there can watch the crew work.
  if (q.room === "stage") return p.room === "floor" && p.hall === 1;
  if (p.room === "stage") return q.hall === 1;
  return Math.hypot(p.x - q.x, p.z - q.z) <= SIGHT && lineOfSight(p, q);
}
export function lastSeen(night, a, b, t) {
  for (let tick = Math.floor(t); tick >= 0; tick -= tick > END ? 5 : 1) {
    if (!sees(night, a, b, tick)) continue;
    const q = whereabouts(night, b, tick);
    return {
      tick,
      now: tick === Math.floor(t),
      place: q.room === "stage" ? "on stage" : "in " + hallName(q.hall),
    };
  }
  return null;
}

export function records(night, id, t) {
  const crowdTick = Math.min(Math.floor(t), END);
  const receipts = night.crowd.receipts;
  const receipt = receipts[readGuest(night.crowd, crowdTick, id).memory];
  const chain = history(receipts, receipts.indexOf(receipt));
  const s = member(night, id);
  const news = s?.news && t >= s.news.tick ? s.news : null;
  const told = receipts
    .filter((r) => r.from === id && r.tick <= t)
    .map((r) => r.to);
  const hold = night.setup.holds.find(
    (h) => h.id === id && t > h.from && t <= h.to,
  );
  return {
    id,
    name: name(id),
    role: s?.role ?? null,
    staff: s,
    receipt,
    chain,
    news,
    believes: receipt.version === 2 || news ? 1 : -1,
    told,
    held: Boolean(hold),
    here: whereabouts(night, id, t),
    onShift: arrived(night, id, t),
  };
}

function receiptLine(r) {
  const from =
    r.from === PROGRAMME
      ? "printed programme"
      : r.from === RADIO
        ? "radio call"
        : r.from === PLAYER
          ? "you"
          : name(r.from);
  return "Receipt · " + from + " → " + name(r.to) + " · " + stamp(r.tick);
}
function sourceSentence(me) {
  const r = me.receipt;
  if (r.from === PROGRAMME) return "It’s printed in my programme.";
  if (r.from === RADIO) return "The call came over my radio at " + stamp(r.tick) + ".";
  if (r.from === PLAYER) return "You told me yourself at " + stamp(r.tick) + ".";
  return name(r.from) + " told me at " + stamp(r.tick) + ".";
}
function newsSentence(me) {
  return me.news.how === "radio"
    ? name(me.news.by) + " radioed me from the stage at " + stamp(me.news.tick) + "."
    : "I found West Hall empty at " + stamp(me.news.tick) + " and worked it out.";
}
const newsLine = (me) =>
  (me.news.how === "radio" ? "Staff radio · " : "Saw West Hall empty · ") + stamp(me.news.tick);
const reply = (text, basis = [], knows = true) => ({ text, basis, knows });
const unknown = (text) => reply(text, [], false);

function venue(me) {
  if (me.news)
    return reply(
      "East Hall. I went to West Hall first, like my programme said. " +
        newsSentence(me),
      [receiptLine(me.receipt), newsLine(me)],
    );
  return reply(
    (me.believes === 1 ? "East Hall. " : "West Hall. ") + sourceSentence(me),
    [receiptLine(me.receipt)],
  );
}
function source(me) {
  if (me.news) return venue(me);
  const r = me.receipt;
  if (r.from === PROGRAMME)
    return reply(
      "Nobody has told me anything. I’m going by the printed programme, and it says West Hall.",
      [receiptLine(r)],
    );
  // Only the direct informant is first-hand. The rest is what that person said about their source.
  const earlier = me.chain.at(-2);
  let text = sourceSentence(me);
  if (r.from >= 0 && earlier && earlier.version === 2)
    text +=
      earlier.from === RADIO
        ? " " + name(r.from) + " took the radio call."
        : earlier.from === PLAYER
          ? " " + name(r.from) + " heard it from you."
          : " " + name(r.from) + " had it from " + name(earlier.from) + ".";
  return reply(text, me.chain.filter((c) => c.version === 2).map(receiptLine));
}
function told(night, me) {
  if (me.believes !== 1 || me.news)
    return reply(
      me.news
        ? "Nobody. I only found out once the work had started."
        : "Told them what? As far as I know the show is in West Hall, like the programme says.",
      [receiptLine(me.receipt)],
    );
  if (!me.told.length)
    return reply("I haven’t passed it on to anyone yet.", [receiptLine(me.receipt)]);
  return reply(
    "I passed it on to " + list(me.told.map(name)) + ".",
    night.crowd.receipts.filter((r) => r.from === me.id && me.told.includes(r.to)).map(receiptLine),
  );
}

const phrases = {
  rack: ["moving the PA rack", "the PA rack"],
  feed: ["setting up power", "the power feed"],
  lights: ["focusing the house lights", "the house lights"],
  sound: ["patching main sound", "the sound desk"],
  zone: ["opening the second speaker zone", "the second speaker zone"],
  cue: ["running the opening cue", "the control booth"],
};
const doingJob = (id) => phrases[id][0];
const placeOf = (id) => phrases[id][1];
function blockers(night, job, local) {
  const waits = job.after
    .filter((id) => !jobAt(night.plan, id, local).done)
    .map((id) => doingJob(id));
  return waits;
}
function crewWork(night, me, t) {
  const local = t - LOADIN,
    plan = night.plan,
    id = me.staff.crew;
  const state = memberState(plan, id, local),
    task = state.part?.task,
    job = task && plan.jobs.find((j) => j.id === task);
  const entry =
    job &&
    plan.entries.find(
      (e) => e.job.id === task && e.team.includes(id) && e.start <= local && local < e.end,
    );
  const mates = entry ? entry.team.filter((i) => i !== id).map((i) => crew[i].name) : [];
  const basis = ["Stage plan · " + stamp(t)];
  const incident = plan.incident;
  const dropped = plan.entries.find((e) => e.interrupted && e.team.includes(id));
  if (state.kind === "away")
    return reply(
      "I’m on a radio call. I had to step away from " +
        (dropped ? doingJob(dropped.job.id) : task ? doingJob(task) : "the floor") +
        " at " + stamp(LOADIN + incident.t) + ".",
      [...basis, "Radio call · " + stamp(LOADIN + incident.t)],
    );
  if (state.kind === "work") {
    let text = "I’m " + doingJob(task) + (mates.length ? " with " + list(mates) : "") + ".";
    // A handover is on record when someone else started this job before the radio call.
    const before = plan.entries.find((e) => e.job.id === task && e.interrupted);
    if (before && incident && !before.team.includes(id) && entry?.start >= incident.t)
      text +=
        " I took it over when " + crew[incident.absent].name +
        " was called to the radio at " + stamp(LOADIN + incident.t) + ".";
    return reply(text, basis);
  }
  if (state.kind === "walk")
    return reply(
      task ? "I’m walking over to " + placeOf(task) + "." : "I’m clearing the floor so the others can work.",
      basis,
    );
  if (state.kind === "standby") {
    const waits = blockers(night, job, local);
    const paused = plan.entries.find((e) => e.job.id === task && e.interrupted);
    if (paused && incident && !waits.length && local >= incident.t)
      return reply(
        crew[incident.absent].name + " was called to the radio at " + stamp(LOADIN + incident.t) +
          ", so I’m holding " + placeOf(task) + " until someone takes over.",
        [...basis, "Radio call · " + stamp(LOADIN + incident.t)],
      );
    if ((job.release ?? 0) > local)
      return reply(
        "I’m in position at " + placeOf(task) + ". I can’t start until Ida brings the reference record up from the archive" +
          (waits.length ? ", and someone still has to finish " + list(waits) : "") + ".",
        [...basis, "Work order · " + job.name],
      );
    return reply(
      "I’m in position at " + placeOf(task) +
        (waits.length
          ? ". I can’t start until someone has finished " + list(waits).replace("finished the reference", "brought the reference") + "."
          : ", waiting for my partner."),
      [...basis, "Work order · " + job.name],
    );
  }
  const left = plan.entries.filter((e) => e.team.includes(id) && e.start > local);
  if (left.length)
    return reply("I’m standing by. My next job is " + doingJob(left[0].job.id) + ".", basis);
  return reply(
    local >= plan.end ? "We’re done. The opening cue has run." : "My jobs are finished. I’m keeping out of the way.",
    basis,
  );
}
function archiveWork(night, t) {
  const local = Math.max(0, t - night.searchStart),
    state = searchState(night.search, local),
    run = night.search;
  const basis = state.evidence.map((e, i) => "Search log · " + stamp(night.searchStart + e.t) + " · entry " + (i + 1));
  if (state.found)
    return reply("I found the sleeve in " + stations[run.visits.at(-1).i].name + ". It’s on its way to the sound desk.", basis);
  if (local < PLACEMENT)
    return reply("I’m watching the archive for the reference sleeve to be filed.", basis);
  const ranked = stations
    .map((s, i) => ({ name: s.name, p: state.weights[i] }))
    .filter((s) => s.p > 0)
    .sort((a, b) => b.p - a.p);
  const visit = state.visit;
  if (run.seen)
    return reply("I saw the sleeve go into " + ranked[0].name + ", so I’m going straight there.", basis);
  const empty = state.inspected.filter((v) => !v.found).map((v) => stations[v.i].name);
  let text = "The screen was in my way when the sleeve was filed, so I didn’t see where it went. ";
  if (empty.length) text += list(empty) + " was empty. ";
  text +=
    ranked.length === 1
      ? "That leaves " + ranked[0].name + "."
      : "It wasn’t in the bins I could see. " + ranked[0].name + " is the likeliest at about " +
        Math.round(ranked[0].p * 100) + "%, then " + list(ranked.slice(1).map((r) => r.name)) + ".";
  if (visit) text += " I’m " + (local >= visit.arrive ? "checking " : "heading to ") + stations[visit.i].name + " now.";
  return reply(text, basis);
}
function doing(night, me, t) {
  if (me.staff && t >= LOADIN) {
    if (!me.onShift) {
      const eta = stamp(LOADIN + me.staff.late);
      if (me.news)
        return reply(
          "I’m late. I went to West Hall because nobody told me the show had moved. " +
            newsSentence(me) + " I’ll be there at " + eta + ".",
          [receiptLine(me.receipt), newsLine(me)],
        );
      if (me.staff.news)
        return reply(
          "I’m in West Hall, where the programme says the show is. The stage here is empty and I’m starting to wonder why.",
          [receiptLine(me.receipt)],
        );
      return reply(
        "I’m still crossing to East Hall. I heard about the move late. I’ll be there at " + eta + ".",
        [receiptLine(me.receipt)],
      );
    }
    return me.staff.crew >= 0 ? crewWork(night, me, t) : archiveWork(night, t);
  }
  const basis = [receiptLine(me.receipt)];
  if (me.held) return reply("Someone has stopped me to talk and I can’t get away.", ["Held · " + stamp(t)]);
  const target = hallName(me.believes);
  if (t >= LOADIN || me.here.speed < 0.05) {
    if (me.here.hall === me.believes)
      return reply(
        me.believes === 1
          ? "I’m in East Hall, waiting for the show."
          : "I’m in West Hall, waiting for the show. It’s quieter in here than I expected.",
        basis,
      );
    return reply("I’m in " + hallName(me.here.hall) + ". I’ll head to " + target + " for the show.", basis);
  }
  return reply("I’m on my way to " + target + ".", basis);
}
function record(night, me, t) {
  if (me.staff?.crew === -1 && me.onShift) return archiveWork(night, t);
  if (me.staff?.crew === -1)
    return reply("The reference sleeve gets filed in the archive at load-in. I’ll fetch it for soundcheck then.", ["Work order · Reference record"]);
  const m = me.staff && me.onShift ? crew[me.staff.crew] : null;
  if (m?.skills.includes("sound")) {
    const basis = ["Work order · Patch main sound"];
    return t >= night.recordReady
      ? reply("Ida brought the reference record up from the archive at " + stamp(night.recordReady) + ".", [...basis, "Handover · " + stamp(night.recordReady)])
      : reply("Ida is fetching the reference record from the archive. Main sound can’t be patched until it’s here. I don’t know which bin it’s in.", basis);
  }
  return unknown(
    me.staff ? "That’s between Ida and the sound desk. I don’t know where it is." : "I don’t know anything about a record.",
  );
}
function crowd(night, me, t) {
  if (me.staff?.crew >= 0 && me.onShift) {
    const zones = night.zones === 2 ? "two speaker zones" : "one speaker zone";
    if (me.staff.role === "Stage manager")
      return reply(
        "I counted " + night.attendance + " in East Hall at load-in, so the work order has " + zones + ".",
        ["Head count · " + stamp(LOADIN), "Work order"],
      );
    return reply(
      "I haven’t counted. The work order has " + zones + ", so I’d guess " +
        (night.zones === 2 ? "a full room." : "a small house."),
      ["Work order"],
    );
  }
  if (me.here.room !== "floor") return unknown("I can’t see the hall from here.");
  let visible = 0;
  for (let other = 0; other < COUNT; other++)
    if (other !== me.id && sees(night, me.id, other, Math.min(t, END))) visible++;
  return reply(
    "I can see " + visible + " other " + (visible === 1 ? "person" : "people") + " from where I’m standing. I couldn’t tell you about the rest.",
    ["Sight · " + stamp(Math.min(t, END))],
  );
}
function whereis(night, me, t, about) {
  if (about == null) return unknown("Who are you looking for?");
  if (about === me.id) return reply("That’s me. I’m right here.", []);
  const seen = lastSeen(night, me.id, about, t);
  if (!seen) return unknown("I haven’t seen " + name(about) + " tonight.");
  return reply(
    seen.now
      ? name(about) + " is " + seen.place + ". I can see them from here."
      : "I last saw " + name(about) + " " + seen.place + " at " + stamp(seen.tick) + ". I don’t know where they went after that.",
    ["Sight · " + stamp(seen.tick)],
  );
}

export function answer(night, id, t, topic, about = null) {
  const me = records(night, id, t);
  switch (topic) {
    case "venue":
      return venue(me);
    case "source":
      return source(me);
    case "told":
      return told(night, me);
    case "doing":
      return doing(night, me, t);
    case "record":
      return record(night, me, t);
    case "crowd":
      return crowd(night, me, t);
    case "whereis":
      return whereis(night, me, t, about);
    default:
      return unknown("I can’t help with that. Ask me where the show is, who told me, what I’m doing, or who I’ve seen.");
  }
}

// Independent check. Every hall, person and bin an answer names must be something that character
// could hold at that moment, worked out from the raw simulation state.
export function leaks(night, id, t, about, text) {
  const me = records(night, id, t),
    found = [];
  // Naming East Hall as a place someone was seen is fine. Saying the show is there is not.
  if (
    me.believes !== 1 &&
    /^East Hall\.|(?:heading|crossing|way|head) to East Hall|waiting for the show\.$/.test(text) &&
    /East Hall/.test(text)
  )
    found.push("East Hall");
  const allowed = new Set([id, ...me.chain.map((r) => r.from), ...me.told]);
  if (about != null) allowed.add(about);
  if (me.news?.by >= 0) allowed.add(me.news.by);
  if (me.staff) for (const s of staffById.keys()) allowed.add(s);
  for (const p of people)
    if (!allowed.has(p.index) && new RegExp("\\b" + p.name + "\\b").test(text))
      found.push(p.name);
  const isIda = me.staff?.crew === -1 && me.onShift;
  for (const s of stations)
    if (!isIda && new RegExp("\\b" + s.name + "\\b").test(text)) found.push(s.name);
  if (isIda && !night.search.seen) {
    // Before she opens the right bin, Ida must not state where the sleeve is.
    const local = Math.max(0, t - night.searchStart),
      state = searchState(night.search, local),
      truth = stations.find((s) => s.id === night.search.destination).name,
      open = state.weights.filter((w) => w > 0).length;
    if (!state.found && open > 1 && new RegExp("(found|saw) the sleeve (in|go into) " + truth).test(text))
      found.push(truth);
  }
  if (/\b\d+ in East Hall\b/.test(text) && !(me.staff?.role === "Stage manager" && me.onShift))
    found.push("head count");
  return found;
}

// Ask every character every topic at moments across the night and count what leaks.
export function audit(night, step = 40) {
  let answers = 0,
    declined = 0;
  const failures = [];
  for (let t = 0; t <= night.end; t += step)
    for (let id = 0; id < COUNT; id++)
      for (const topic of topics) {
        const about = topic === "whereis" ? (id * 7 + t) % COUNT : null;
        const a = answer(night, id, t, topic, about);
        answers++;
        if (!a.knows) declined++;
        const bad = leaks(night, id, t, about, a.text);
        if (bad.length) failures.push({ t, id, topic, text: a.text, bad });
      }
  return { answers, declined, failures };
}
export { DOORS };
