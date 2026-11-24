import { history, PLAYER } from "../comparison/simulation.js";
import { PLACEMENT } from "../perception/search.js";
import { crew } from "../crew/scenario.js";
import { memberState } from "../crew/planner.js";
import { CHANGE, FORK, LOADIN, COUNT, staff, nameOf } from "./world.js";
import { RESCUE_AT } from "./director.js";
import { records } from "./mind.js";

// A guided run for presenting. Each step fires at a moment on the night clock, holds the clock
// while the caption is read, and uses the same actions as a player. Targets are worked out from
// the night as it stands, so the tour follows whatever the director chose.
const HOLD_MS = 3600;
export function tourSteps({ api, caption }) {
  const night = () => api.night;
  const ida = staff.at(-1).id;
  const fooled = () =>
    staff.find((s) => s.crew >= 0 && records(night(), s.id, api.t).believes !== 1) ?? staff[2];
  // Someone one step removed from the player, so their answer names both links.
  const heardFromYou = () => {
    const r = night().crowd.receipts;
    for (let id = 0; id < COUNT; id++) {
      const mine = records(night(), id, api.t).receipt;
      if (mine.from >= 0 && history(r, r.indexOf(mine)).at(-2)?.from === PLAYER) return id;
    }
    return null;
  };
  const waiting = () =>
    crew.find((m) => {
      const s = memberState(night().plan, m.id, api.t - LOADIN);
      return s.kind === "standby" && s.part?.task === "sound";
    });
  const steps = [
    { at: 8, text: "Forty people in the foyer. The printed programme says West Hall." },
    {
      at: CHANGE + 5,
      text: "One guest gets a radio call: the show has moved to East Hall.",
      run: () => api.ask(night().crowd.manager, "venue", null, "Where’s the show?"),
    },
    {
      at: FORK + 7,
      when: () => api.gm.hold,
      text: () => "The game master stops " + nameOf(api.gm.hold.id) + " just before the news gets passed on.",
      run: () => api.ask(api.gm.hold.id, "doing", null, "What are you doing?"),
    },
    {
      at: FORK + 10,
      text: () => nameOf(fooled().id) + " works here, and hasn’t heard. Ask anyway.",
      run: () => api.ask(fooled().id, "venue", null, "Where’s the show?"),
    },
    {
      at: RESCUE_AT - 1,
      when: () => api.gm.rescues?.length,
      text: () => "You get two sentences. Spend one on " + nameOf(api.gm.rescues[0]) + ".",
      // The sentence lands on the tick the game master tested.
      run: () => api.tell(api.gm.rescues[0], undefined, RESCUE_AT),
    },
    {
      at: 215,
      when: () => heardFromYou() != null,
      text: "Ask anyone how they know. The trail leads back to you.",
      run: () => api.ask(heardFromYou(), "source", null, "Who told you?"),
    },
    {
      at: LOADIN + 10,
      text: "Load-in. Whoever heard the news is on stage. Whoever didn’t is in the wrong hall.",
      run: () => api.ask(staff[2].id, "crowd", null, "How many came?"),
    },
    {
      at: () => night().searchStart + PLACEMENT + 22,
      text: "Ida only knows what she saw being filed.",
      run: () => api.ask(ida, "record", null, "Where’s the record?"),
    },
    {
      at: () => night().recordReady - 12,
      when: () => waiting(),
      text: "Sound can’t start without that record. The crew know why they’re waiting.",
      run: () => api.ask(waiting().person.index, "doing", null, "What are you doing?"),
    },
    {
      at: () => night().cueAt + 4,
      text: () => (night().saved ? "Opening cue, before the doors. One sentence saved the night." : "The doors open before the stage is ready."),
    },
  ];
  let index = 0,
    holding = 0;
  const due = (s) => (typeof s.at === "function" ? s.at() : s.at);
  return {
    // Freeze the clock while a caption is on screen.
    gate(ms) {
      if (holding <= 0) return ms;
      holding -= ms;
      if (holding <= 0) caption.hidden = true;
      return 0;
    },
    tick() {
      const step = steps[index];
      if (!step || holding > 0 || api.t < due(step)) return;
      index++;
      if (step.when && !step.when()) return;
      caption.textContent = typeof step.text === "function" ? step.text() : step.text;
      caption.hidden = false;
      holding = HOLD_MS;
      step.run?.();
    },
  };
}
