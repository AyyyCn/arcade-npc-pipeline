import { buildNight, summary, FORK, HOLD, COUNT, nameOf } from "./world.js";
import { play, snapshot } from "../comparison/simulation.js";

// The director looks for trouble the player can still fix. It plays every candidate night to the
// end, and then plays every reply the player could give, before it commits to anything.
export const RESCUE_AT = FORK + 12;
export const moods = {
  quiet: "Quiet night",
  tense: "Tense",
  knife: "Knife-edge",
};
const holdOf = (id) => ({ id, from: FORK, to: FORK + HOLD });

// Every reply the player could give to one interruption. The foyer is simulated once per reply and
// reused for both states of the archive screen. Guests who already know are skipped, because
// telling them changes nothing.
function rescues(seed, id) {
  const holds = [holdOf(id)],
    from = snapshot(seed, { holds }, RESCUE_AT - 1);
  const open = [],
    shut = [];
  let nights = 0;
  for (let guest = 0; guest < COUNT; guest++) {
    if (from.receipts[from.guests[guest].memory].version === 2) continue;
    const tells = [{ id: guest, tick: RESCUE_AT }];
    const crowd = play(seed, { holds, tells, frames: false, from });
    if (buildNight({ seed, holds, tells }, crowd).saved) open.push(guest);
    if (buildNight({ seed, holds, tells, screen: "closed" }, crowd).saved)
      shut.push(guest);
    nights += 2;
  }
  return { open, shut, nights };
}

// Yield to the page between batches of simulated nights.
export async function survey(seed, pause = () => Promise.resolve()) {
  const calm = summary(buildNight({ seed }));
  const options = [];
  let nights = 1;
  for (let id = 0; id < COUNT; id++) {
    const holds = [holdOf(id)];
    const crowd = play(seed, { holds, frames: false });
    const outcome = summary(buildNight({ seed, holds }, crowd));
    nights++;
    const option = { id, name: nameOf(id), outcome, rescues: [], shut: null };
    if (!outcome.saved) {
      const found = rescues(seed, id);
      option.rescues = found.open;
      // A second twist is allowed when at least one reply still saves the night.
      option.shut = found.open.length ? found.shut : null;
      nights += found.nights;
      await pause(nights);
    }
    options.push(option);
  }
  return { seed, calm, options, nights };
}

export function choose(report, mood) {
  const broken = report.options.filter((o) => !o.outcome.saved);
  const fair = broken.filter((o) => o.rescues.length);
  const counts = {
    considered: report.options.length,
    harmless: report.options.length - broken.length,
    rejected: broken.length - fair.length,
    fair: fair.length,
    nights: report.nights,
  };
  if (mood === "quiet" || !fair.length)
    return { mood, hold: null, screen: "open", counts, option: null };
  const damage = (o) => o.outcome.attendance * 1000 + o.outcome.margin;
  let option, screen = "open";
  if (mood === "knife") {
    // Fewest ways out. Shut the archive screen as well when a way out survives it.
    option = fair
      .slice()
      .sort((a, b) => a.rescues.length - b.rescues.length || damage(a) - damage(b))[0];
    if (option.shut?.length) screen = "closed";
  } else {
    const roomy = fair.filter((o) => o.rescues.length >= 3);
    option = (roomy.length ? roomy : fair)
      .slice()
      .sort((a, b) => damage(a) - damage(b))[0];
  }
  return {
    mood,
    hold: holdOf(option.id),
    screen,
    counts,
    option,
    rescues: screen === "closed" ? option.shut : option.rescues,
  };
}

// The crowd branch the director compares against, with nobody held.
export const untouched = (seed) => play(seed);
