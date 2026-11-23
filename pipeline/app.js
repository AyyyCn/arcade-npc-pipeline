import { briefs } from "./briefs.js";
import { compileBrief, playBrief } from "./scenario.js";
import { makeJobs } from "../crew/scenario.js";
import { initialPlan } from "../crew/planner.js";
import { crewView } from "../crew/view.js";
import { archiveView } from "../perception/view.js";
import { searchState } from "../perception/search.js";

const el = (id) => document.getElementById(id);
const prompt = el("game-brief");
const live = document.documentElement.hasAttribute("data-interviews");
const preview = initialPlan(makeJobs(40));
let stageView,
  archivePromise,
  drawArchive,
  scenario,
  run,
  revision = 0;
let delay = false,
  block = false,
  tick = 0,
  ready = false;
el("pipe-source").textContent = live
  ? "Live local model"
  : "Saved model briefs";
prompt.readOnly = !live;
el("pipe-examples").replaceChildren(
  ...briefs.map((b, i) => new Option(b.name, i)),
);

function showRows() {
  const rows = [];
  if (scenario.forecast)
    rows.push([
      "Social memory",
      delay ? "A message missed" : "Word of mouth",
      "?crowd",
    ]);
  if (run.stage)
    rows.push([
      "Crew coordination",
      run.zones === 1 ? "Smaller stage setup" : "Full stage setup",
      scenario.forecast
        ? "?crew&run=" +
          (delay ? "altered" : "original") +
          "&archive=" +
          (block ? "closed" : "open") +
          "&bin=dispatch"
        : null,
    ]);
  rows.push([
    "Perception & search",
    run.search.seen ? "Filing witnessed" : "Search under way",
    "?perception&bin=dispatch&screen=" + (block ? "closed" : "open"),
  ]);
  el("pipe-rows").replaceChildren(
    ...rows.map(([name, value, url]) => {
      const row = document.createElement("div"),
        dt = document.createElement("dt"),
        dd = document.createElement("dd");
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.textContent = name;
        dt.append(a);
      } else dt.textContent = name;
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    }),
  );
}

function paint() {
  if (!ready) return;
  if (!run) {
    stageView(preview, 44);
    return;
  }
  if (run.stage) stageView(run.stage, Math.min(tick, run.stage.end));
  else if (drawArchive)
    drawArchive(
      run.search,
      Math.min(tick, run.search.end),
      searchState(run.search, Math.min(tick, run.search.end)),
    );
  el("pipe-clock").textContent = run.stage ? "East Hall" : "Record archive";
}

function replay() {
  run = playBrief(scenario, { delayMessenger: delay, blockView: block });
  tick = 0;
  el("pipe-title").textContent = run.stage
    ? scenario.forecast
      ? "Opening night moves halls"
      : "Opening night in the booked hall"
    : "The missing pressing";
  el("pipe-caption").textContent = run.stage
    ? "The crew prepares the stage"
    : "Ida searches the archive";
  el("pipe-stage").hidden = !run.stage;
  el("pipe-archive").hidden = Boolean(run.stage);
  el("pipe-venue").hidden = true;
  el("pipe-inferred").hidden = false;
  el("pipe-delay").hidden = !scenario.forecast;
  el("pipe-block").hidden = false;
  el("pipe-delay").setAttribute("aria-pressed", String(delay));
  el("pipe-block").setAttribute("aria-pressed", String(block));
  el("pipe-delay").textContent = delay
    ? "Restore the messenger"
    : "Delay the messenger";
  el("pipe-block").textContent = block
    ? "Restore Ida’s view"
    : "Block Ida’s view";
  let status;
  if (!run.stage)
    status =
      "Ida " +
      (block
        ? "misses the filing and searches the likely bins."
        : "sees where the pressing is filed and goes straight there.");
  else if (block)
    status =
      "Ida misses the filing. Soundcheck waits while she searches the archive.";
  else if (delay && scenario.forecast)
    status =
      "The news misses part of the crowd. The crew scales back the stage setup.";
  else if (scenario.forecast)
    status =
      "Guests pass on the new address. The crew prepares for the crowd that hears.";
  else
    status =
      "The guests know the hall. The crew prepares for the booked audience.";
  el("pipe-status").textContent = status;
  showRows();
  paint();
}

function reset() {
  revision++;
  scenario = run = null;
  delay = block = false;
  tick = 0;
  el("run-brief").disabled = !ready;
  el("pipe-title").textContent = "From a game brief to play";
  el("pipe-venue").hidden = el("pipe-stage").hidden = false;
  el("pipe-inferred").hidden =
    el("pipe-archive").hidden =
    el("pipe-delay").hidden =
    el("pipe-block").hidden =
      true;
  el("pipe-caption").textContent = "Side B stage";
  el("pipe-clock").textContent = "Venue preview";
  el("pipe-status").textContent = "";
  paint();
}
function selectExample() {
  prompt.value = briefs[Number(el("pipe-examples").value)].text;
  reset();
}
el("pipe-examples").onchange = selectExample;
prompt.oninput = reset;
el("pipe-delay").onclick = () => {
  delay = !delay;
  replay();
};
el("pipe-block").onclick = () => {
  block = !block;
  replay();
};

el("pipe-form").onsubmit = async (event) => {
  event.preventDefault();
  const token = ++revision,
    text = prompt.value.trim();
  if (!text) {
    el("pipe-status").textContent = "Enter a game brief.";
    return;
  }
  el("run-brief").disabled = true;
  el("pipe-status").textContent = live
    ? "Interpreting the game brief…"
    : "Loading the saved interpretation…";
  try {
    let facts;
    if (live) {
      const result = await fetch("/game-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const body = await result.json();
      if (!result.ok)
        throw new Error(
          body.error || "The model could not interpret this game brief.",
        );
      facts = body.facts;
    } else {
      const saved = briefs.find((b) => b.text === text);
      if (!saved) throw new Error("Choose one of the saved game briefs.");
      facts = saved.facts;
    }
    const compiled = compileBrief(facts);
    if (compiled.goal === "find_record") {
      archivePromise ??= archiveView(el("pipe-archive")).catch((error) => {
        archivePromise = null;
        throw error;
      });
      drawArchive = await archivePromise;
    }
    if (token !== revision) return;
    delay = block = false;
    scenario = compiled;
    replay();
  } catch (error) {
    if (token === revision) {
      reset();
      el("pipe-status").textContent = error.message;
    }
  } finally {
    if (token === revision) el("run-brief").disabled = false;
  }
};

window.advanceTime = (ms) => {
  if (!run) return;
  tick = Math.min(tick + ms / 100, run.stage?.end ?? run.search.end);
  paint();
};
window.render_game_to_text = () =>
  JSON.stringify({
    mode: "pipeline",
    ready,
    live,
    goal: scenario?.goal ?? null,
    venue: scenario?.venue ?? null,
    systems: scenario?.systems ?? [],
    attendance: run?.attendance ?? null,
    zones: run?.zones ?? null,
    bins: run?.search.visits.length ?? null,
    recordReady: run?.search.end ?? null,
    soundStarts:
      run?.stage?.entries.find((e) => e.job.id === "sound")?.start ?? null,
    clock: Math.floor(tick),
    delayed: delay,
    blocked: block,
  });
let last;
function frame(now) {
  if (run && tick < (run.stage?.end ?? run.search.end))
    window.advanceTime(last ? Math.min(100, now - last) : 0);
  last = now;
  requestAnimationFrame(frame);
}
selectExample();
crewView(el("pipe-stage"))
  .then((view) => {
    stageView = view;
    ready = true;
    el("run-brief").disabled = false;
    paint();
    requestAnimationFrame(frame);
  })
  .catch((error) => {
    el("pipe-status").textContent = error.message;
  });
