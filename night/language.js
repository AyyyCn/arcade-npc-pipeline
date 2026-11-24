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

// One constrained word from an OpenAI-compatible local model. The grammar limits the reply to the
// listed choices, so the model can pick a move but cannot invent one.
async function choice(modelUrl, system, shots, text, options) {
  const response = await fetch(new URL("/v1/chat/completions", modelUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      temperature: 0,
      seed: 42,
      max_tokens: 6,
      grammar: "root ::= " + options.map((o) => JSON.stringify(o)).join(" | "),
      messages: [
        { role: "system", content: system },
        ...shots.flatMap(([user, reply]) => [
          { role: "user", content: user },
          { role: "assistant", content: reply },
        ]),
        { role: "user", content: text },
      ],
    }),
  });
  if (!response.ok) throw Error("The local model could not read this.");
  const word = (await response.json()).choices?.[0]?.message?.content?.trim();
  if (!options.includes(word)) throw Error("Unrecognized response");
  return word;
}
const actShots = [
  ["Bo, how did you find out?", "ask"],
  ["what are you up to right now", "ask"],
  ["Is the room filling up?", "ask"],
  ["anyone seen Lark?", "ask"],
  ["do you like jazz?", "ask"],
  ["tell me a joke", "ask"],
  ["Cora, the concert has moved to East Hall", "tell"],
  ["let Hugo know it's in the other hall now", "tell"],
  ["you should go to East Hall, the show is there", "tell"],
  ["Sam, heads up, it's in East Hall tonight", "tell"],
  ["write me a story", "ask"],
  ["Maya, pick up your radio", "call"],
  ["I need Esme on a call, take her off the job", "call"],
  ["slide the screen out of the way in the archive", "screen"],
  ["put the divider back so she can't see", "screen"],
  ["the partition is blocking her view, shift it", "screen"],
];
const topicShots = [
  ["where is the gig happening?", "venue"],
  ["which hall should I go to", "venue"],
  ["where are you headed for the show", "venue"],
  ["who gave you that information?", "source"],
  ["how do you know about it", "source"],
  ["where did you hear that", "source"],
  ["who have you passed it on to?", "told"],
  ["did you let anybody else know", "told"],
  ["have you shared the news with someone", "told"],
  ["what are you busy with?", "doing"],
  ["why are you standing around", "doing"],
  ["what is taking so long", "doing"],
  ["why are you late", "doing"],
  ["have you found the album yet?", "record"],
  ["which bin is the vinyl in", "record"],
  ["where did the sleeve end up", "record"],
  ["how full is the hall?", "crowd"],
  ["how many people showed up", "crowd"],
  ["have you seen Lark around?", "whereis"],
  ["where did Hugo go", "whereis"],
  ["do you know where Cora is", "whereis"],
  ["what's the weather like?", "other"],
  ["sing me a song", "other"],
  ["what do you think of the mayor", "other"],
];
const stateShots = [
  ["fold the screen back", "open"],
  ["get the divider out of her way", "open"],
  ["clear her line of sight", "open"],
  ["pull the screen across", "closed"],
  ["block her view of the bins", "closed"],
];

// The model decides what kind of sentence this is. Names are matched against the cast list, so
// the model is never trusted to produce one. The result is validated like any other instruction.
export async function interpret(text, selected, modelUrl) {
  const names = namesIn(text);
  const correct = /^(actually|no[,.! ]|wait|instead|scratch|scrap|sorry)|\binstead\b/i.test(text.trim());
  const act = await choice(
    modelUrl,
    "A player at a record shop gig says one sentence. Classify it with one word. ask = any question or request for a character to answer. tell = the player gives someone the news that the show moved to East Hall. call = the player gets a crew member on the radio or pulls them off their job. screen = the player moves the screen, divider or partition in the archive.",
    actShots,
    text,
    ["ask", "tell", "call", "screen"],
  );
  if (act === "screen") {
    const state = await choice(
      modelUrl,
      "The player moves the archive screen. Answer open if the sentence clears the view, or closed if it blocks the view.",
      stateShots,
      text,
      ["open", "closed"],
    );
    return validate({ act, state, correct });
  }
  // A name addresses someone when it opens or closes the sentence, or when nobody is selected.
  // Otherwise the player is talking to the selected person about somebody else.
  const first = names.length ? people[names[0]].name : "";
  const vocative =
    names.length > 0 &&
    new RegExp("^(?:ask |tell |hey |ok |so )?" + first + "\\b|,\\s*" + first + "[?.!]*$", "i").test(text.trim());
  const addressed = selected == null || vocative || /\b(tell|let|warn|inform|radio|call)\b/i.test(text);
  const who = (addressed ? names[0] : null) ?? selected;
  const others = addressed ? names.slice(1) : names;
  if (who == null) return validate({ act: "none", correct });
  // Checks the cast list and the sentence can settle without the model. Only crew carry radios,
  // a radio call has to mention one, and a tell has to carry the news.
  const news = /\beast\b|\bmoved?\b|\bvenue\b|\bhall\b|address|changed|relocat|other room|switched/i.test(text);
  const paging = /\bradio\b|\bcall\b|\bpage\b|walkie|step (out|away)|\boff the\b|a word with/i.test(text);
  let kind = act;
  // An order that takes someone off their job has to say so.
  if (kind === "call" && (!crewKeys.has(people[who].key) || !paging)) kind = news ? "tell" : "ask";
  // A correction inherits the news from the order it replaces.
  if (kind === "tell" && !news && !correct) kind = "ask";
  if (kind !== "ask") return validate({ act: kind, who, correct });
  const topic = await choice(
    modelUrl,
    "Classify a question put to a character at a record shop gig with one word. venue = where the show is or where to go. source = who told them or how they know. told = who they passed the news to. doing = what they are doing, why, or why they are late or waiting. record = the reference record, sleeve, album or its bin. crowd = how many people came. whereis = where another named person is or whether they were seen. other = anything else.",
    topicShots,
    text,
    askTopics,
  );
  // “Where is Ada?” needs someone other than the listener.
  const about = others.find((id) => id !== who) ?? null;
  return validate({ act: "ask", who, topic, about, correct });
}
