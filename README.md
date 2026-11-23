# Arcade NPC Pipeline

> Make a game about saving a sold-out record shop gig when the venue changes at the last minute.

The player wants to save opening night. Guests need to hear the new address, the crew needs to prepare for the crowd that arrives, and soundcheck needs a reference record from the shop’s archive. The prototype connects those behaviors in the same scenario.

[Run the game brief](https://ayyycn.github.io/arcade-npc-pipeline/?pipeline) · [Watch the pitch film](https://ayyycn.github.io/arcade-npc-pipeline/media/npc-pipeline.mp4) · [Download the editable slide](media/npc-pipeline.pptx) · [View the slide](media/npc-pipeline.png)

## What to try

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

Open [the local game brief](http://127.0.0.1:19447/?pipeline). For free-text authoring, start an OpenAI-compatible local model and launch the app with its endpoint. During the recording, the model ran on the same machine.

```sh
MODEL_URL=http://127.0.0.1:19442 npm start
```

For a static site use `npm run build:site`. The output is in `site/`.

## Source and pitch materials

The previous listening room, crowd, crew and archive scenes are included. The original showcase slide and film are in `media/npc-systems.*`. The newer pitch uses in-engine footage of the same scenarios and leads with the creator’s game idea.

[Handoff for another coding session](CLAUDE.md) · [Editable pitch and capture instructions](docs/PITCH.md) · [Original scene gallery](https://ayyycn.github.io/arcade-npc-pipeline/?home) · [Art and software credits](docs/CREDITS.md)
