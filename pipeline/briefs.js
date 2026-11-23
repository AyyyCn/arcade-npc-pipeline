export const briefs = [
  {
    name: "Opening night",
    text: "Make a game about saving a sold-out record shop gig when the venue changes at the last minute.",
    facts: { goal: "stage_show", venue: "moved" },
  },
  {
    name: "The missing pressing",
    text: "Make a cozy mystery about a rare pressing that vanished from a record shop.",
    facts: { goal: "find_record", venue: "none" },
  },
  {
    name: "The booked hall",
    text: "Make a game about putting on a record shop gig in the hall everyone booked.",
    facts: { goal: "stage_show", venue: "booked" },
  },
];

export function validateFacts(facts) {
  if (facts?.goal === "find_record" && facts.venue === "none")
    return { goal: facts.goal, venue: facts.venue };
  if (facts?.goal === "stage_show" && ["booked", "moved"].includes(facts.venue))
    return { goal: facts.goal, venue: facts.venue };
  throw new Error(
    "This venue supports putting on a gig or finding a lost record. Try a brief with one of those goals.",
  );
}
