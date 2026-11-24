import {
  play,
  END,
  HZ,
  WALL,
  FORK,
  HOLD,
  CHANGE,
  COUNT,
  DEFAULT_SEED,
  hall,
} from "../comparison/simulation.js";
import { crew, makeJobs, DOORS, SECOND_ZONE_AT } from "../crew/scenario.js";
import { initialPlan, recover } from "../crew/planner.js";
import { simulate, observer } from "../perception/search.js";
import { people } from "../npc/people.js";

// One clock for the whole night, in 100 ms ticks. The foyer scene runs first. Load-in starts
// when the crowd has settled, and the archive search starts with it.
export const LOADIN = END;
export const DOORS_AT = LOADIN + DOORS;
export const FULL_HOUSE = 30;
export const TELLS = 2;
const HALL_DOOR = { x: WALL + 0.8, z: 0 };
const WALK = 1.5;
const RADIO_EXCHANGE = 20;
const EMPTY_HALL = 45;

// The same people are guests in the foyer and staff once the work starts.
export const staff = [
  ...crew.map((m) => ({
    id: m.person.index,
    name: m.name,
    role: m.title,
    crew: m.id,
  })),
  { id: observer.index, name: observer.name, role: "Archivist", crew: -1 },
];
export const staffById = new Map(staff.map((s) => [s.id, s]));

function arrivals(crowd) {
  const at = staff.map((s) => {
    const p = crowd.final[s.id];
    return {
      ...s,
      x: p.x,
      z: p.z,
      hall: hall(p.x),
      informed: crowd.receipts[p.memory].version === 2,
    };
  });
  // Whoever is already in East Hall radios the colleagues who are missing.
  const caller = at.find((s) => s.hall === 1);
  return at.map((s) => {
    if (s.hall === 1) return { ...s, late: 0, news: null };
    const walk = Math.ceil(
      (Math.hypot(HALL_DOOR.x - s.x, HALL_DOOR.z - s.z) / WALK) * HZ,
    );
    if (s.informed) return { ...s, late: walk, news: null };
    const wait = caller ? RADIO_EXCHANGE : EMPTY_HALL;
    return {
      ...s,
      late: wait + walk,
      news: {
        tick: LOADIN + wait,
        how: caller ? "radio" : "empty",
        by: caller ? caller.id : -1,
      },
    };
  });
}

export function normalize(options = {}) {
  return {
    seed: options.seed ?? DEFAULT_SEED,
    holds: options.holds ?? [],
    tells: options.tells ?? [],
    screen: options.screen === "closed" ? "closed" : "open",
    call: options.call ?? null,
  };
}

// Every outcome below is computed by the three simulations. Nothing here is scripted.
const plans = new Map();
function planFor(attendance, recordReady, late) {
  const key = [attendance >= SECOND_ZONE_AT, recordReady, ...late].join("/");
  if (!plans.has(key)) {
    if (plans.size > 400) plans.clear();
    const jobs = makeJobs(attendance, recordReady);
    plans.set(key, { jobs, plan: initialPlan(jobs, crew, late) });
  }
  return plans.get(key);
}
// Pass `crowd` to reuse a foyer run when only the archive or the stage differs.
export function buildNight(options, crowd) {
  const setup = normalize(options);
  crowd ??= play(setup.seed, { holds: setup.holds, tells: setup.tells });
  const team = arrivals(crowd);
  const ida = team.at(-1);
  const search = simulate(setup.screen === "closed", "dispatch");
  const recordReady = ida.late + search.end;
  const attendance = crowd.east;
  const late = team.slice(0, crew.length).map((s) => s.late);
  let { jobs, plan } = planFor(attendance, recordReady, late),
    callError = null;
  const base = plan;
  if (setup.call) {
    try {
      plan = recover(base, setup.call.at, setup.call.member, setup.call.ticks);
    } catch (error) {
      callError = error.message;
    }
  }
  const onTime = plan.end <= DOORS;
  return {
    setup,
    crowd,
    team,
    search,
    searchStart: LOADIN + ida.late,
    recordReady: LOADIN + recordReady,
    jobs,
    base,
    plan,
    callError,
    attendance,
    zones: attendance >= SECOND_ZONE_AT ? 2 : 1,
    cueAt: LOADIN + plan.end,
    onTime,
    saved: onTime && attendance >= FULL_HOUSE,
    end: LOADIN + Math.max(DOORS, plan.end) + 20,
  };
}

// The three views each run on their own local clock.
export function clocks(night, t) {
  return {
    act: t < LOADIN ? 1 : 2,
    crowd: Math.min(t, END),
    stage: Math.max(0, t - LOADIN),
    archive: Math.max(0, t - night.searchStart),
  };
}

export function summary(night) {
  return {
    attendance: night.attendance,
    zones: night.zones,
    cue: night.cueAt,
    doors: DOORS_AT,
    margin: DOORS_AT - night.cueAt,
    record: night.recordReady,
    late: night.team.filter((s) => s.late > 0).map((s) => s.name),
    saved: night.saved,
    onTime: night.onTime,
  };
}

// What the player did, as the simulation recorded it.
export function tellResult(night, tell) {
  const receipt = night.crowd.receipts.find(
    (r) => r.from === -3 && r.to === tell.id && r.tick === tell.tick,
  );
  if (!receipt) return { accepted: false, reached: 0 };
  // Count everyone whose news traces back to this sentence.
  const index = night.crowd.receipts.indexOf(receipt);
  const roots = new Set([index]);
  night.crowd.receipts.forEach((r, i) => {
    if (roots.has(r.parent)) roots.add(i);
  });
  return { accepted: true, reached: roots.size - 1 };
}

export const nameOf = (id) => people[id].name;
export const personByName = (word) =>
  people.find((p) => p.key === String(word).toLowerCase());
export { FORK, HOLD, CHANGE, COUNT, END, DOORS, DEFAULT_SEED };
