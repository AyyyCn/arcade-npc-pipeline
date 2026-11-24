import { createView } from "../comparison/view.js";
import { crewView } from "../crew/view.js";
import { archiveView } from "../perception/view.js";
import { searchState, PLACEMENT } from "../perception/search.js";
import { jobAt } from "../crew/planner.js";
import { crew } from "../crew/scenario.js";
import { PLAYER } from "../comparison/simulation.js";
import {
  buildNight,
  clocks,
  summary,
  tellResult,
  LOADIN,
  DOORS_AT,
  TELLS,
  staff,
  staffById,
  nameOf,
  CHANGE,
  FORK,
  END,
  COUNT,
  DEFAULT_SEED,
} from "./world.js";
import { choose } from "./director.js";
import { answer, audit, records } from "./mind.js";
import { read, validate } from "./language.js";
import { people } from "../npc/people.js";
import { tourSteps } from "./tour.js";

const $ = (id) => document.getElementById(id);
const stamp = (t) => (t / 10).toFixed(1) + " s";
const params = new URLSearchParams(location.search);
const seedParam = params.get("seed");
const seed =
  seedParam && /^\d{1,10}$/.test(seedParam) && Number(seedParam) <= 4294967295
    ? Number(seedParam)
    : DEFAULT_SEED;
const live = document.documentElement.hasAttribute("data-interviews");
const touring = params.has("tour");
const set = (id, text) => {
  const node = $(id);
  if (node.textContent !== text) node.textContent = text;
};
const node = (tag, props = {}, ...children) => {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...children);
  return n;
};

let mood = ["quiet", "tense", "knife"].includes(params.get("mood"))
    ? params.get("mood")
    : "tense",
  report = null,
  gm = { hold: null, screen: "open", counts: null, option: null },
  orders = [],
  night,
  ghost,
  t = 0,
  playing = false,
  speed = 2,
  selected = 0,
  log = [],
  checked = null,
  surveyMs = 0,
  progress = 0,
  showRescuers = false,
  tour = null;
let crowdView, stageDraw, archiveDraw;
const dirty = { crowd: true, stage: true, archive: true, ui: true };
const viewsReady = () => crowdView && stageDraw && archiveDraw;
const ready = () => Boolean(viewsReady() && report);

function rebuild() {
  gm = report ? choose(report, mood) : gm;
  const holds = gm.hold ? [gm.hold] : [];
  const screen = orders.findLast((o) => o.kind === "screen")?.state ?? gm.screen;
  const call = orders.find((o) => o.kind === "call") ?? null;
  ghost = buildNight({ seed, holds, screen: gm.screen });
  night = buildNight({
    seed,
    holds,
    screen,
    tells: orders.filter((o) => o.kind === "tell").map(({ id, tick }) => ({ id, tick })),
    call: call && { member: call.member, at: call.at, ticks: call.ticks },
  });
  t = Math.min(t, night.end);
  dirty.crowd = dirty.stage = dirty.archive = dirty.ui = true;
  checked = null;
  clearTimeout(rebuild.timer);
  rebuild.timer = setTimeout(() => {
    checked = audit(night);
    dirty.ui = true;
  }, 60);
  marks();
}

function marks() {
  const at = (tick) => (100 * tick) / night.end + "%";
  const items = [
    [CHANGE, "", "Venue changes", true],
    ...(gm.hold ? [[FORK, "gm", "The director steps in", false]] : []),
    ...orders.map((o) => [
      o.kind === "call" ? LOADIN + o.at : o.tick,
      "you",
      o.label,
      false,
    ]),
    [LOADIN, "", "Load-in", true],
    [night.recordReady, "", "Record reaches the sound desk", false],
    [night.cueAt, "", "Opening cue", false],
    [DOORS_AT, "", "Doors", true],
  ];
  $("n-marks").replaceChildren(
    ...items.flatMap(([tick, cls, label, named]) => [
      node("i", { className: cls, title: label + " · " + stamp(tick), style: "left:" + at(tick) }),
      ...(named ? [node("span", { style: "left:" + at(tick) }, label)] : []),
    ]),
  );
  $("n-scrub").max = String(night.end);
}

// ---- Orders. The page proposes, the simulation accepts or refuses. ----
const said = (text) => ({ kind: "order", you: text });
const refuse = (you, why) => ({ kind: "refused", you, text: why });
function tell(id, you, at = 0) {
  const line = you ?? "Tell " + nameOf(id) + " the new address.";
  const used = orders.filter((o) => o.kind === "tell").length;
  if (t < CHANGE)
    return refuse(line, "You don’t know yet. The radio call about the move comes at " + stamp(CHANGE) + ".");
  if (t >= END)
    return refuse(line, "Too late. The crowd has settled and both halls are seated.");
  const mind = records(night, id, t);
  if (mind.believes === 1)
    return refuse(line, nameOf(id) + " already knows. That sentence is still yours to spend.");
  if (used >= TELLS)
    return refuse(line, "You have used both sentences. Undo one to change your mind.");
  const order = { kind: "tell", id, tick: Math.max(Math.floor(t) + 1, at), label: "You tell " + nameOf(id) };
  orders.push(order);
  rebuild();
  return { ...said(line), order };
}
function call(id, you) {
  const member = staffById.get(id),
    line = you ?? "Radio " + nameOf(id) + " away from the stage.";
  const local = Math.floor(t - LOADIN);
  if (!member || member.crew < 0) return refuse(line, "Only the stage crew carry radios.");
  if (t < LOADIN) return refuse(line, "The crew aren’t working yet. Load-in starts at " + stamp(LOADIN) + ".");
  if (orders.some((o) => o.kind === "call")) return refuse(line, "The radio channel is already in use. Undo that call first.");
  if (!records(night, id, t).onShift) return refuse(line, nameOf(id) + " hasn’t reached the stage yet.");
  if (local >= night.plan.end) return refuse(line, "The opening cue has already run.");
  const order = { kind: "call", member: member.crew, at: local, ticks: 120, id, label: "You radio " + nameOf(id) };
  orders.push(order);
  rebuild();
  if (night.callError) {
    orders.pop();
    rebuild();
    return refuse(line, "The crew can’t cover that right now.");
  }
  return { ...said(line), order };
}
function screen(state, you) {
  const line = you ?? (state === "open" ? "Fold the archive screen back." : "Pull the archive screen across.");
  if (night.setup.screen === state) return refuse(line, "The screen is already " + state + ".");
  if (t >= night.searchStart + PLACEMENT)
    return refuse(line, "Too late. The sleeve has been filed and Ida has seen what she has seen.");
  const order = { kind: "screen", state, tick: Math.floor(t), label: "You " + (state === "open" ? "open" : "close") + " the archive screen" };
  orders.push(order);
  rebuild();
  return { ...said(line), order };
}
function undo() {
  const order = orders.pop();
  if (!order) return null;
  log = log.filter((e) => e.order !== order);
  rebuild();
  return order;
}
function ask(id, topic, about, you) {
  selected = id;
  const a = answer(night, id, t, topic, about);
  return { kind: "ask", you, id, at: t, ...a };
}
function push(entry) {
  if (!entry) return;
  log.unshift(entry);
  if (log.length > 40) log.length = 40;
  dirty.ui = true;
}
function perform(intent, text) {
  if (!ready())
    return refuse(text, "One moment. The game master is still deciding how tonight goes.");
  if (intent.correct && orders.length) undo();
  if (intent.act === "tell") return tell(intent.who, text);
  if (intent.act === "call") return call(intent.who, text);
  if (intent.act === "screen") return screen(intent.state, text);
  if (intent.act === "ask") return ask(intent.who, intent.topic, intent.about, text);
  return refuse(text, "Say who you’re talking to, or pick someone in the venue.");
}
async function say(text) {
  let intent = null;
  if (live)
    try {
      const response = await fetch("/night-say", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, selected }),
        signal: AbortSignal.timeout(13000),
      });
      if (response.ok) intent = validate((await response.json()).intent);
    } catch {
      intent = null;
    }
  push(perform(intent ?? read(text, selected), text));
}

// ---- Drawing ----
function orderStatus(entry) {
  const o = entry.order;
  if (!orders.includes(o)) return "Withdrawn.";
  if (o.kind === "tell") {
    if (t < o.tick) return nameOf(o.id) + " will hear it at " + stamp(o.tick) + ".";
    const result = tellResult(night, o);
    if (!result.accepted) return nameOf(o.id) + " heard it from someone else first.";
    const now = night.crowd.receipts.filter((r) => r.tick <= t);
    const roots = new Set([night.crowd.receipts.findIndex((r) => r.from === PLAYER && r.to === o.id)]);
    night.crowd.receipts.forEach((r, i) => {
      if (roots.has(r.parent) && now.includes(r)) roots.add(i);
    });
    const n = roots.size - 1;
    return nameOf(o.id) + " knows. " + (n ? "The news has reached " + n + " more " + (n === 1 ? "person" : "people") + " through them." : "Nobody has heard it from them yet.");
  }
  if (o.kind === "call") {
    const until = LOADIN + night.plan.incident.until;
    return t < until
      ? nameOf(o.id) + " is on the radio until " + stamp(until) + ". The crew replanned around it."
      : nameOf(o.id) + " is back. The crew replanned around the call.";
  }
  return o.state === "open" ? "Ida has a clear view of the bins." : "Ida’s view of the bins is blocked.";
}
function drawLog() {
  $("n-log").replaceChildren(
    ...log.map((e) => {
      const li = node("li", { className: e.kind });
      if (e.you) li.append(node("div", { className: "q" }, "You · " + e.you));
      if (e.kind === "ask") {
        li.append(node("div", { className: "a" }, node("b", {}, nameOf(e.id) + " · " + stamp(e.at) + "  "), e.text));
        li.append(
          node(
            "div",
            { className: "basis" },
            ...(e.basis.length
              ? e.basis.slice(-6).map((b) => node("span", {}, b))
              : [node("span", { className: "none" }, e.knows ? "No record needed" : "No record of this")]),
          ),
        );
      } else if (e.kind === "order") li.append(node("div", { className: "a" }, orderStatus(e)));
      else li.append(node("div", { className: "a" }, e.text));
      return li;
    }),
  );
}
const quick = [
  ["venue", "Where’s the show?"],
  ["source", "Who told you?"],
  ["told", "Who have you told?"],
  ["doing", "What are you doing?"],
  ["record", "Where’s the record?"],
  ["crowd", "How many came?"],
];
function drawPanel() {
  const held = gm.hold?.id,
    manager = night.crowd.manager;
  const featured = [...staff.map((s) => s.id), manager, ...(held != null ? [held] : [])].filter(
    (id, i, all) => all.indexOf(id) === i,
  );
  const pick = node("select", { ariaLabel: "Everyone in the venue" }, new Option("Everyone…", ""));
  for (const p of people.slice().sort((a, b) => a.name.localeCompare(b.name)))
    pick.append(new Option(p.name, p.index));
  pick.onchange = () => pick.value !== "" && choosePerson(Number(pick.value));
  $("n-who").replaceChildren(
    ...featured.map((id) =>
      node("button", { ariaPressed: String(id === selected), onclick: () => choosePerson(id) }, nameOf(id)),
    ),
    pick,
  );
  const me = staffById.get(selected);
  $("n-person").replaceChildren(
    nameOf(selected) + " ",
    node("span", {}, me ? me.role : selected === manager ? "Guest, on radio duty" : "Guest"),
  );
  const about = selected === staff[2].id ? staff[0] : staff[2];
  $("n-quick").replaceChildren(
    ...quick.map(([topic, label]) =>
      node("button", { onclick: () => push(ask(selected, topic, null, label)) }, label),
    ),
    node(
      "button",
      { onclick: () => push(ask(selected, "whereis", about.id, "Have you seen " + about.name + "?")) },
      "Seen " + about.name + "?",
    ),
  );
  const left = TELLS - orders.filter((o) => o.kind === "tell").length;
  const buttons = [
    node(
      "button",
      { id: "n-tell", onclick: () => push(perform({ act: "tell", who: selected })) },
      "Tell " + nameOf(selected) + " the show moved · " + left + " left",
    ),
  ];
  if (me?.crew >= 0)
    buttons.push(node("button", { id: "n-call", onclick: () => push(perform({ act: "call", who: selected })) }, "Radio " + me.name + " away"));
  const next = night.setup.screen === "open" ? "closed" : "open";
  buttons.push(
    node(
      "button",
      { id: "n-screen", onclick: () => push(perform({ act: "screen", state: next })) },
      next === "open" ? "Open the archive screen" : "Close the archive screen",
    ),
  );
  if (orders.length)
    buttons.push(node("button", { id: "n-undo", onclick: () => undo() && (dirty.ui = true) }, "Undo last order"));
  for (const b of buttons) b.disabled = !ready();
  $("n-orders").replaceChildren(...buttons);
}
function drawDirector() {
  for (const b of document.querySelectorAll("[data-mood]")) {
    b.setAttribute("aria-pressed", String(b.dataset.mood === mood));
    b.disabled = !report;
  }
  const hint = $("n-gm-hint");
  if (!report) {
    set("n-gm-status", progress ? progress.toLocaleString("en") + " nights played" : "thinking…");
    hint.hidden = true;
    return;
  }
  const c = gm.counts,
    nights = c.nights.toLocaleString("en");
  set("n-gm-status", nights + " nights played");
  const plain = report.calm;
  let text;
  if (!gm.hold)
    text =
      "The game master leaves tonight alone. " + plain.attendance + " of " + COUNT + " people reach East Hall and the opening cue runs " +
      stamp(Math.abs(plain.margin)) + (plain.margin >= 0 ? " before doors." : " after doors.");
  else {
    const o = gm.option,
      lost = o.outcome;
    text =
      "The game master tried stopping each of the " + c.considered + " people in the foyer for four seconds. " +
      c.harmless + " of those nights turn out fine. " + (c.fair + c.rejected) + " are lost" +
      (c.rejected ? ", and it threw out " + c.rejected + " that nothing you say could fix" : ", and every one can still be fixed by you") +
      ". It chose " + (mood === "knife" ? "the one with the fewest ways out" : "the worst of them") + ": " + o.name +
      " gets stopped at " + stamp(FORK) + ". Left alone, " + lost.attendance + " people reach East Hall" +
      (lost.late.length ? " and " + lost.late.length + " of the staff start late" : "") + "." +
      (gm.screen === "closed" ? " It also pulls the archive screen across, so Ida can’t watch the sleeve being filed." : "");
  }
  $("n-gm-text").replaceChildren(text);
  hint.hidden = !gm.hold;
  if (gm.hold) {
    const n = gm.rescues.length;
    hint.replaceChildren(
      showRescuers
        ? "Telling any one of these people right after the interruption saves the night: " + gm.rescues.map(nameOf).join(", ") + ". "
        : n + " of " + COUNT + " people can save the night if you tell them in time. ",
      node("button", { id: "n-reveal", onclick: () => ((showRescuers = !showRescuers), (dirty.ui = true)) }, showRescuers ? "Hide" : "Show who"),
    );
  }
}
function drawOutcome() {
  const a = summary(ghost),
    b = summary(night);
  const cue = (s) => stamp(Math.abs(s.margin)) + (s.margin >= 0 ? " before doors" : " after doors");
  const late = (s) => (s.late.length ? s.late.join(", ") : "Nobody");
  const cell = (value, good, shown = true) =>
    node("td", { className: shown ? (good ? "good" : "bad") : "" }, shown ? value : "…");
  const row = (label, ...cells) => node("tr", {}, node("th", { scope: "row" }, label), ...cells);
  const plain = !(gm.hold || gm.screen === "closed");
  $("n-out").replaceChildren(
    row(
      plain ? "As planned" : "If you say nothing",
      cell(a.attendance + " of " + COUNT, a.attendance >= 30),
      cell(late(a), !a.late.length),
      cell(stamp(a.record), a.record <= b.record),
      cell(cue(a), a.onTime),
    ),
    row(
      "Your night",
      cell(b.attendance + " of " + COUNT, b.attendance >= 30, t >= END),
      cell(late(b), !b.late.length, t >= END),
      cell(stamp(b.record), b.record <= a.record, t >= b.record),
      cell(cue(b), b.onTime, t >= b.cue),
    ),
  );
  set("n-chip-a", plain ? "As planned" : "If you say nothing");
  const done = t >= b.cue;
  set("n-verdict", done ? "" : "still in play");
  const result = $("n-result");
  result.hidden = !done;
  result.className = "n-result " + (b.saved ? "good" : "bad");
  set(
    "n-result",
    b.saved
      ? "Night saved. " + b.attendance + " in the room and the cue ran " + stamp(b.margin) + " before doors."
      : b.onTime
        ? "On time, but to a thin house. Only " + b.attendance + " found East Hall."
        : "Night lost. The doors opened " + stamp(-b.margin) + " before the stage was ready.",
  );
}
function drawProof() {
  set("n-proof-seed", "Seed " + seed);
  if (checked) {
    set("n-proof-audit", checked.answers.toLocaleString("en") + " answers checked, " + checked.failures.length + " leaks");
    set(
      "n-proof-audit-note",
      "Every character was asked every question across this night. " + checked.declined.toLocaleString("en") + " times the answer was “I don’t know”.",
    );
  } else set("n-proof-audit", "Checking answers…");
  if (report) {
    set("n-proof-gm", report.nights.toLocaleString("en") + " nights in " + (surveyMs / 1000).toFixed(1) + " s");
    set("n-proof-gm-note", "The game master played each one to the end before choosing.");
  } else set("n-proof-gm", "Game master at work");
  set("n-proof-lang", live ? "Local model reads free text" : "Built-in reader for free text");
  set(
    "n-proof-lang-note",
    live ? "It picks a move. The simulation decides what happens." : "Start the server with a local model to read any phrasing.",
  );
  set("n-reader", live ? "local model" : "built-in reader");
}
function captions(c) {
  const knows = (run) => {
    let n = 0;
    for (let id = 0; id < COUNT; id++) if (records(run, id, c.crowd).receipt.version === 2) n++;
    return n;
  };
  if (c.act === 1) {
    const n = t < CHANGE ? 0 : knows(night);
    set("n-cap-crowd", t < CHANGE ? "Everyone trusts the printed programme" : n + " know the new address · " + (COUNT - n) + (COUNT - n === 1 ? " still trusts" : " still trust") + " the programme");
  } else set("n-cap-crowd", night.attendance + " in East Hall · " + night.crowd.halls.filter((h) => h === -1).length + " waiting in West Hall");
  const plan = night.plan,
    local = c.stage;
  let stage;
  if (c.act === 1) stage = "Load-in at " + stamp(LOADIN);
  else if (local >= plan.end) stage = "Opening cue complete";
  else {
    const active = plan.entries.filter((e) => e.start <= local && local < e.end);
    const missing = night.team.filter((s) => s.crew >= 0 && t < LOADIN + s.late);
    stage = active.length
      ? active.map((e) => e.job.short).join(" · ")
      : missing.length
        ? "Waiting for " + missing.map((s) => s.name).join(", ")
        : jobAt(plan, "sound", local).done
          ? "Crew moving into position"
          : t < night.recordReady
            ? "Waiting on the reference record"
            : "Crew moving into position";
  }
  set("n-cap-stage", stage);
  const state = searchState(night.search, c.archive);
  set(
    "n-cap-archive",
    c.act === 1
      ? "Screen " + night.setup.screen
      : t < night.searchStart
        ? "Ida hasn’t arrived"
        : state.evidence.at(-1).text,
  );
}
function drawUI() {
  const c = clocks(night, t);
  set("n-time", stamp(t));
  set("n-act", c.act === 1 ? "Word spreads" : t >= night.cueAt ? "Showtime" : "Load-in");
  set("n-play", playing ? "Pause" : t >= night.end ? "Replay" : "Play");
  $("n-play").disabled = !ready();
  $("n-scrub").value = String(Math.round(t));
  $("n-fig-stage").classList.toggle("idle", c.act === 1);
  $("n-fig-archive").classList.toggle("idle", c.act === 1 || t < night.searchStart);
  captions(c);
  drawOutcome();
  if (!dirty.ui) return;
  dirty.ui = false;
  drawDirector();
  drawPanel();
  drawLog();
  drawProof();
}
let lastKey = "";
function paint() {
  if (!night) return;
  const c = clocks(night, t);
  if (crowdView && (c.act === 1 || dirty.crowd)) {
    const hold = gm.hold?.id ?? night.crowd.manager;
    crowdView.draw(ghost.crowd, night.crowd, c.crowd, {
      guests: night.crowd.guests,
      witness: selected,
      hold,
      both: true,
      held: Boolean(gm.hold),
      zoom: gm.hold ? 0.55 : 0,
    });
    dirty.crowd = false;
  }
  if (stageDraw && (c.act === 2 || dirty.stage)) {
    stageDraw(night.plan, c.stage);
    dirty.stage = false;
  }
  if (archiveDraw && (c.act === 2 || dirty.archive)) {
    archiveDraw(night.search, c.archive, searchState(night.search, c.archive));
    dirty.archive = false;
  }
  // Text changes a few times a second at most.
  const key = Math.floor(t / 3) + "/" + playing + "/" + dirty.ui + "/" + ready();
  if (key !== lastKey || dirty.ui) {
    lastKey = key;
    drawUI();
  }
}
function jump(tick, play = false) {
  t = Math.max(0, Math.min(night.end, tick));
  playing = play && t < night.end;
  dirty.crowd = dirty.stage = dirty.archive = dirty.ui = true;
  paint();
}
function choosePerson(id) {
  selected = id;
  dirty.crowd = dirty.ui = true;
  paint();
}
function advance(ms) {
  if (!night) return;
  if (playing && ready()) {
    if (tour) ms = tour.gate(ms);
    t = Math.min(night.end, t + (ms / 100) * speed);
    if (t >= night.end) playing = false;
  }
  if (tour) tour.tick();
  paint();
}

// ---- Controls ----
$("n-play").onclick = () => jump(t >= night.end ? 0 : t, !playing);
$("n-scrub").oninput = (e) => jump(Number(e.target.value));
for (const b of document.querySelectorAll("[data-speed]"))
  b.onclick = () => {
    speed = Number(b.dataset.speed);
    for (const other of document.querySelectorAll("[data-speed]"))
      other.setAttribute("aria-pressed", String(other === b));
  };
for (const b of document.querySelectorAll("[data-mood]"))
  b.onclick = () => setMood(b.dataset.mood);
function setMood(next) {
  if (!report || next === mood) return;
  mood = next;
  orders = [];
  log = [];
  showRescuers = false;
  rebuild();
  selected = gm.hold?.id ?? night.crowd.manager;
  jump(0);
}
$("n-say").onsubmit = (e) => {
  e.preventDefault();
  const text = $("n-input").value.trim();
  if (!text) return;
  $("n-input").value = "";
  say(text);
};
$("n-crowd").onclick = (e) => {
  if (!crowdView) return;
  const r = e.currentTarget.getBoundingClientRect();
  const id = crowdView.pick(e.clientX - r.left, e.clientY - r.top);
  if (id != null) choosePerson(id);
};
document.addEventListener("keydown", (e) => {
  if (e.repeat || /INPUT|SELECT|BUTTON|A|TEXTAREA/.test(e.target.tagName)) return;
  if (e.key === " " && ready()) {
    e.preventDefault();
    jump(t >= night.end ? 0 : t, !playing);
  }
});
window.addEventListener("resize", () => {
  dirty.crowd = dirty.stage = dirty.archive = true;
});

// ---- Test and capture hooks, matching the other scenes ----
window.advanceTime = (ms) => advance(ms);
window.nightSay = (text) => say(text);
window.nightJump = (tick, play) => jump(tick, play);
window.render_game_to_text = () => {
  if (!night) return JSON.stringify({ mode: "night", ready: false });
  const mine = summary(night),
    theirs = summary(ghost);
  return JSON.stringify({
    mode: "night",
    ready: ready(),
    seed,
    live,
    tick: Math.floor(t),
    act: clocks(night, t).act,
    playing,
    mood,
    held: gm.hold ? nameOf(gm.hold.id) : null,
    screen: night.setup.screen,
    rescuers: gm.rescues?.map(nameOf) ?? [],
    orders: orders.map((o) => o.label),
    yours: mine,
    untouched: theirs,
    selected: nameOf(selected),
    last: log[0] ? { kind: log[0].kind, text: log[0].kind === "order" ? orderStatus(log[0]) : log[0].text, knows: log[0].knows ?? null } : null,
    leaks: checked ? checked.failures.length : null,
    answers: checked ? checked.answers : null,
    nights: report?.nights ?? null,
  });
};

// ---- Boot ----
rebuild();
selected = night.crowd.manager;
const started = performance.now();
const worker = new Worker(
  URL.createObjectURL(new Blob([NIGHT_WORKER_SOURCE], { type: "text/javascript" })),
);
worker.onmessage = ({ data }) => {
  if (data.error) {
    set("n-gm-text", "The game master could not finish its search. " + data.error);
    return;
  }
  if (data.nights) {
    progress = data.nights;
    dirty.ui = true;
    return;
  }
  report = data.report;
  surveyMs = performance.now() - started;
  worker.terminate();
  orders = [];
  log = [];
  rebuild();
  selected = gm.hold?.id ?? night.crowd.manager;
  if (touring) tour = tourSteps({ api, caption: $("n-tour") });
  jump(0, touring);
};
worker.postMessage({ seed });
const api = {
  get t() {
    return t;
  },
  get night() {
    return night;
  },
  get gm() {
    return gm;
  },
  ask: (id, topic, about, you) => push(ask(id, topic, about, you)),
  tell: (id, you, at) => push(tell(id, you, at)),
  select: choosePerson,
};
const fail = (error) => {
  $("n-loading").hidden = false;
  set("n-loading", "The venue needs a browser with WebGL 2. " + error.message);
};
createView($("n-crowd"), { stacked: true })
  .then((view) => {
    crowdView = view;
    $("n-loading").hidden = true;
    dirty.crowd = dirty.ui = true;
  })
  .catch(fail);
crewView($("n-stage"))
  .then((draw) => {
    stageDraw = draw;
    dirty.stage = dirty.ui = true;
  })
  .catch(fail);
archiveView($("n-archive"))
  .then((draw) => {
    archiveDraw = draw;
    dirty.archive = dirty.ui = true;
  })
  .catch(fail);
let last;
function frame(now) {
  advance(last == null ? 0 : Math.min(100, now - last));
  last = now;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
