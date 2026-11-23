import { COUNT } from "../comparison/simulation.js";
import { makeJobs, readForecast } from "../crew/scenario.js";
import { initialPlan } from "../crew/planner.js";
import { simulate } from "../perception/search.js";
import { validateFacts } from "./briefs.js";

export function compileBrief(facts) {
  const { goal, venue } = validateFacts(facts);
  const show = goal === "stage_show";
  const relocated = show && venue === "moved";
  const forecast = relocated ? readForecast(new URLSearchParams()) : null;
  return {
    goal,
    venue,
    forecast,
    systems: [
      ...(relocated ? ["social"] : []),
      ...(show ? ["crew"] : []),
      "perception",
    ],
  };
}

export function playBrief(
  scenario,
  { delayMessenger = false, blockView = false } = {},
) {
  const search = simulate(blockView, "dispatch");
  if (scenario.goal === "find_record")
    return { search, stage: null, attendance: null, zones: null };
  const { forecast } = scenario;
  const attendance = forecast
    ? forecast[delayMessenger ? "altered" : "original"]
    : COUNT;
  const jobs = makeJobs(attendance, search.end);
  const stage = initialPlan(jobs);
  return {
    search,
    stage,
    attendance,
    zones: jobs.some((j) => j.id === "zone") ? 2 : 1,
  };
}
