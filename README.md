# Arcade NPC Pipeline

> The gig just moved halls. You get two sentences to save it.

**One night at Side B** puts every system in this project on one clock. Forty people stand in the foyer when the venue changes. What each person hears decides where they go, which staff turn up for work, when the reference record reaches the sound desk and whether the opening cue runs before the doors. A game master searches the possible nights for trouble you can still fix. You can ask anyone anything, and they answer from their own records.

[Play one night](https://ayyycn.github.io/arcade-npc-pipeline/) · [Watch the guided tour](https://ayyycn.github.io/arcade-npc-pipeline/?night&tour) · [How the night works](docs/NIGHT.md)

## What to try in the night

- Press **Play** and do nothing. The top strip shows where the crowd ends up without you.
- Ask the stage manager where the show is while she still trusts her programme. Then ask her again after load-in.
- Tell one guest the show moved. Ask someone else who told them, and follow the trail back to you.
- Say “Actually, tell Vera instead”. The order is replaced and the night is replayed from that moment.
- During load-in, radio a stagehand away mid-job and ask the others what they are doing.
- Switch the game master to **Knife-edge**. It picks the interruption with the fewest ways out and shuts the archive screen as well.

## The game brief

> Make a game about saving a sold-out record shop gig when the venue changes at the last minute.

The player wants to save opening night. Guests need to hear the new address, the crew needs to prepare for the crowd that arrives, and soundcheck needs a reference record from the shop’s archive. The game-brief prototype connects those behaviors in the same scenario.

[Run the game brief](https://ayyycn.github.io/arcade-npc-pipeline/?pipeline) · [Watch the pitch film](https://ayyycn.github.io/arcade-npc-pipeline/media/npc-pipeline.mp4) · [Download the editable slide](media/npc-pipeline.pptx) · [View the slide](media/npc-pipeline.png)

## What to try in the game brief

- Run **Opening night**, then delay the messenger. A missed conversation changes who reaches the hall, which changes the crew’s work order.
- Block Ida’s view of the filing. She searches the likely bins and soundcheck waits for her to find the record.
- Switch the game brief to **The missing pressing**. The same archive supplies the investigation for a cozy mystery. In **The booked hall**, the stage crew prepares for the ticketed audience.

The public page offers saved model interpretations. Each run executes the simulations in the browser. The local server accepts new wording through a model. It interprets a premise within the record shop’s supported situations and connects implemented behaviors. [Experiment details](docs/SIMULATIONS.md)

## Run locally

Use Node.js 20 or newer and a WebGL 2 browser.

```sh
npm ci
npm run build
npm start
```

Open [the night](http://127.0.0.1:19447/) or [the local game brief](http://127.0.0.1:19447/?pipeline). For free-text authoring, start an OpenAI-compatible local model and launch the app with its endpoint. During the recording, the model ran on the same machine.

```sh
MODEL_URL=http://127.0.0.1:19442 npm start
```

With a model connected, the night reads any phrasing in its “Say anything” box. For example, with llama.cpp:

```sh
llama-server -m qwen2.5-1.5b-instruct-q4_k_m.gguf --port 19442
```

`MODEL_URL=http://127.0.0.1:19442 npm run check:model` scores the reading against the running model.

For a static site use `npm run build:site`. The output is in `site/`.

## Source and pitch materials

The previous listening room, crowd, crew and archive scenes are included. The original showcase slide and film are in `media/npc-systems.*`. The newer pitch uses in-engine footage of the same scenarios and leads with the creator’s game idea.

[Handoff for another coding session](CLAUDE.md) · [The night](docs/NIGHT.md) · [Editable pitch and capture instructions](docs/PITCH.md) · [Original scene gallery](https://ayyycn.github.io/arcade-npc-pipeline/?home) · [Art and software credits](docs/CREDITS.md)
