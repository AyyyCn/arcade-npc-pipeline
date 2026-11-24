import { people } from "../npc/people.js";
import { crew } from "../crew/scenario.js";

// Free text becomes one small instruction. The simulation decides what happens next.
//   ask    { who, topic, about }   question for one character
//   tell   { who }                 give one guest the new address
//   call   { who }                 radio a crew member away from their job
//   screen { state }               open or close the archive screen
// `correct` is set when the sentence replaces the player's last order.
export const acts = ["ask", "tell", "call", "screen", "none"];
export const askTopics = [
  "venue",
  "source",
  "told",
  "doing",
  "record",
  "crowd",
  "whereis",
  "other",
];
const crewKeys = new Set(crew.map((m) => m.person.key));

export function namesIn(text) {
  const found = [];
  for (const word of text.toLowerCase().match(/[a-z]+/g) ?? []) {
    const person = people.find((p) => p.key === word);
    if (person && !found.includes(person.index)) found.push(person.index);
  }
  return found;
}

const rules = [
  ["source", /who (told|said)|how (did|do) you (know|hear|find)|where did you hear|says who|heard (it|that) from|your source/],
  ["told", /who (did|have) you (tell|told)|did you (tell|pass)|pass(ed)? it on|told anyone|tell anyone/],
  ["whereis", /where( is|’s|'s| are)? \w+\??$|have you seen|did you see|seen \w+|where did \w+ go/],
  ["record", /record|sleeve|pressing|vinyl|\bbins?\b|archive/],
  ["crowd", /how many|head ?count|crowd|audience|turn ?out|full house|people (are )?(here|coming)/],
  ["venue", /where.*(show|gig|concert|set|music|play|headed|going|heading)|which hall|what hall|the venue|where to/],
  ["doing", /what are you|what’s going on|what's going on|why|busy|late|status|what happened|how’s it going|how's it going|doing|up to|waiting/],
];

// A deterministic reader that covers the phrasings the buttons and tour use. A local model, when
// one is connected, replaces it for free text and must return the same shape.
export function read(text, selected = null) {
  const raw = text.trim(),
    lower = raw.toLowerCase();
  const correct = /^(actually|no[,.! ]|wait|instead|scratch that|sorry)/.test(lower) || /\binstead\b/.test(lower);
  const names = namesIn(raw);
  const who = names[0] ?? selected;
  if (/\b(open|clear|fold|move|pull back)\b.*\b(screen|divider)\b/.test(lower))
    return { act: "screen", state: "open", correct };
  if (/\b(close|shut|block|unfold)\b.*\b(screen|divider|view)\b/.test(lower))
    return { act: "screen", state: "closed", correct };
  const informing =
    /\b(tell|inform|warn|let)\b/.test(lower) ||
    /(moved|is now in|changed) .*east|\bin east hall\b|it’s in east hall|it's in east hall|show moved|venue (has )?changed|new address/.test(lower);
  const asking = /\?|^(who|what|where|why|how|have|did|do|are|is)\b/.test(lower) || /\bask\b/.test(lower);
  if (/\b(radio|call|page)\b/.test(lower) && who != null && crewKeys.has(people[who].key) && !asking)
    return { act: "call", who, correct };
  if (informing && !/\bask\b/.test(lower) && !/who (did|have) you|did you tell|told anyone/.test(lower) && who != null)
    return { act: "tell", who, correct };
  if (who == null) return { act: "none", correct };
  const question = lower.replace(/^ask \w+,? ?(about )?/, "");
  for (const [topic, pattern] of rules)
    if (pattern.test(question)) {
      if (topic !== "whereis") return { act: "ask", who, topic, about: null, correct };
      // “Where is Ada?” needs a second name, or a single name that is not the listener.
      const about = names.length > 1 ? names[1] : selected != null && names[0] !== selected ? names[0] : null;
      if (about == null) continue;
      return { act: "ask", who: names.length > 1 ? names[0] : selected, topic, about, correct };
    }
  return { act: "ask", who, topic: "other", about: null, correct };
}

// The same shape, checked, for anything a model returns.
export function validate(intent) {
  const person = (id) => Number.isInteger(id) && id >= 0 && id < people.length;
  if (!intent || !acts.includes(intent.act)) throw Error("Unreadable instruction");
  const correct = Boolean(intent.correct);
  if (intent.act === "none") return { act: "none", correct };
  if (intent.act === "screen")
    return { act: "screen", state: intent.state === "closed" ? "closed" : "open", correct };
  if (!person(intent.who)) throw Error("No such person");
  if (intent.act === "call") {
    if (!crewKeys.has(people[intent.who].key)) throw Error("Only the stage crew carry radios");
    return { act: "call", who: intent.who, correct };
  }
  if (intent.act === "tell") return { act: "tell", who: intent.who, correct };
  const topic = askTopics.includes(intent.topic) ? intent.topic : "other";
  const about = topic === "whereis" && person(intent.about) ? intent.about : null;
  return { act: "ask", who: intent.who, topic: topic === "whereis" && about == null ? "other" : topic, about, correct };
}

const schema = {
  type: "object",
  properties: {
    act: { type: "string", enum: acts },
    who: { type: "string", enum: [...people.map((p) => p.name), "nobody"] },
    topic: { type: "string", enum: askTopics },
    about: { type: "string", enum: [...people.map((p) => p.name), "nobody"] },
    state: { type: "string", enum: ["open", "closed"] },
    correct: { type: "boolean" },
  },
  required: ["act", "who", "topic", "about", "state", "correct"],
  additionalProperties: false,
};
const example = (user, reply) => [
  { role: "user", content: user },
  { role: "assistant", content: JSON.stringify(reply) },
];
const blank = { who: "nobody", topic: "other", about: "nobody", state: "open", correct: false };

// Ask an OpenAI-compatible local model for the same instruction. The output is constrained to the
// schema and then validated, so the model can choose among moves but cannot invent one.
export async function interpret(text, selected, modelUrl) {
  const listener = selected == null ? "nobody" : people[selected].name;
  const response = await fetch(new URL("/v1/chat/completions", modelUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({
      temperature: 0,
      seed: 42,
      max_tokens: 96,
      response_format: { type: "json_object", schema },
      messages: [
        {
          role: "system",
          content:
            "Turn what the player says at a record shop gig into one instruction. act: ask = a question for a character; tell = give a character the news that the show moved to East Hall; call = radio a crew member away; screen = open or close the archive screen; none = anything else. who = the character addressed, or the current listener when no name is given. topic for ask: venue (where the show is), source (who told them), told (who they told), doing (what they are doing or why), record (the reference record), crowd (how many people), whereis (where another person is; put that person in about), other. correct = true when the player is replacing their previous order. Return JSON.",
        },
        ...example("Listener: nobody. Player: Ada, who told you about the move?", { ...blank, act: "ask", who: "Ada", topic: "source" }),
        ...example("Listener: Kit. Player: have you seen Nina anywhere?", { ...blank, act: "ask", who: "Kit", topic: "whereis", about: "Nina" }),
        ...example("Listener: nobody. Player: Otto, the gig is in East Hall now.", { ...blank, act: "tell", who: "Otto" }),
        ...example("Listener: nobody. Player: actually, let Vera know instead", { ...blank, act: "tell", who: "Vera", correct: true }),
        ...example("Listener: Wes. Player: get on the radio, I need you", { ...blank, act: "call", who: "Wes" }),
        ...example("Listener: nobody. Player: fold the archive screen back", { ...blank, act: "screen", state: "open" }),
        ...example("Listener: Ida. Player: what's the best pizza in town?", { ...blank, act: "ask", who: "Ida", topic: "other" }),
        { role: "user", content: "Listener: " + listener + ". Player: " + text },
      ],
    }),
  });
  if (!response.ok) throw Error("The local model could not read this.");
  const raw = JSON.parse((await response.json()).choices[0].message.content);
  const id = (name) => people.find((p) => p.name === name)?.index ?? null;
  return validate({ ...raw, who: id(raw.who) ?? selected, about: id(raw.about) });
}
