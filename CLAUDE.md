# Working on this repo

This is a standalone record shop simulation. The browser demos and pitch build run from this checkout. Start by reading [the project overview](README.md) and [the experiment map](docs/SIMULATIONS.md).

## Change the authoring workflow

- Edit `pipeline/briefs.js` for the saved game premises and their recorded interpretations. The locally configured model reads free text through `pipeline/model.js` and `POST /game-brief` in `serve.mjs`.
- Edit `pipeline/scenario.js` to change how a premise selects behaviors or how an outcome passes between systems. The crowd supplies attendance, the archive supplies the soundcheck release time and the stage planner owns the assignments.
- Edit `pipeline/app.js` and `pipeline/layout.html` for the creator view. The static site clearly labels its saved briefs. Local free-text authoring is identified separately in the interface.
- `comparison/`, `crew/`, `perception/` and the original listening room contain the underlying simulations. Keep the simulation as the authority for all reported outcomes.

## Verify a change

```sh
npm ci
npx playwright install chromium
npm run build
npm start
```

In a second shell run `npm test`. To use desktop Chrome, run `BROWSER_CHANNEL=chrome npm test`. Set `DEMO_URL` when testing a different local server or the hosted build. The browser tests exercise all original scenes and the game-brief route. Use a local model to verify new wording or changed classifications before updating the saved briefs.

## Change the pitch

Read [the pitch source map](docs/PITCH.md). The slide layout, all copy, speaker notes and film captions have ordinary text sources in `pitch/`. Keep the game premise in the creator’s voice. Case-specific counts and times belong in the experiment notes or tests. Capture actual game movement for footage.

The public project contains the Side B simulations. Earlier research also exercised an Arcade worker schedule in a separately installed engine checkout. [The experiments document](docs/SIMULATIONS.md) records its scope.
