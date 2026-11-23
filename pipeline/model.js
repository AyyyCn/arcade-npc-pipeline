import { validateFacts } from "./briefs.js";

const situations = {
  concert_relocated: { goal: "stage_show", venue: "moved" },
  concert_as_booked: { goal: "stage_show", venue: "booked" },
  lost_record: { goal: "find_record", venue: "none" },
};
const schema = {
  type: "object",
  properties: {
    situation: {
      type: "string",
      enum: [...Object.keys(situations), "unrelated"],
    },
  },
  required: ["situation"],
  additionalProperties: false,
};

export async function interpretBrief(prompt, modelUrl) {
  const response = await fetch(new URL("/v1/chat/completions", modelUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      temperature: 0,
      seed: 42,
      max_tokens: 48,
      response_format: { type: "json_object", schema },
      messages: [
        {
          role: "system",
          content:
            "Identify the player's situation from the game premise. A gig, show or concert to organize is concert_as_booked unless it explicitly changes venue, in which case choose concert_relocated. A missing album, pressing or vinyl to recover is lost_record. For an unrelated game choose unrelated. Return the JSON situation.",
        },
        { role: "user", content: "Help me put on a concert tonight." },
        { role: "assistant", content: '{"situation":"concert_as_booked"}' },
        {
          role: "user",
          content:
            "I want to get the show running after the old theatre closed and we moved next door.",
        },
        { role: "assistant", content: '{"situation":"concert_relocated"}' },
        { role: "user", content: "Make a platformer about a comet." },
        { role: "assistant", content: '{"situation":"unrelated"}' },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok)
    throw new Error("The local model could not read this game brief.");
  const result = await response.json();
  const { situation } = JSON.parse(result.choices[0].message.content);
  return validateFacts(situations[situation]);
}
