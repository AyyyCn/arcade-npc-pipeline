# Working on this repo

This is a standalone record shop simulation. The playable night, the browser demos and the pitch build run from this checkout. Start by reading [the project overview](README.md) and [the experiment map](docs/SIMULATIONS.md).

## Change the night

The landing page is one playable night that runs the crowd, the crew and the archive on a single clock. Read [how the night works](docs/NIGHT.md) first.

- `night/world.js` joins the three simulations. Staff who end the foyer scene in the wrong hall arrive late, and the planner works around them. Change the rules of the night here.
- `night/mind.js` holds what each character knows and how they answer. An answer may only use that character’s records. `leaks` and `audit` check this independently, so extend them when you add a topic.
- `night/director.js` is the game master. It plays every interruption and every reply before choosing. `night/worker.js` runs it off the main thread.
- `night/language.js` turns free text into one instruction. The built-in reader and the local model return the same shape, and `validate` checks both. The model route is `POST /night-say` in `serve.mjs`.
- `night/app.js`, `night/layout.html` and `night/tour.js` are the page and the guided tour. The tour uses the same actions as a player.

The simulation stays the authority. The page proposes an order and the simulation accepts or refuses it.

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

In a second shell run `npm test`. To use desktop Chrome, run `BROWSER_CHANNEL=chrome npm test`. Set `DEMO_URL` when testing a different local server or the hosted build. The browser tests exercise the night, all original scenes and the game-brief route. The server reads `play.html` once at startup, so restart it after a build. Use a local model to verify new wording or changed classifications before updating the saved briefs.

## Change the pitch

Read [the pitch source map](docs/PITCH.md). The slide layout, all copy, speaker notes and film captions have ordinary text sources in `pitch/`. Keep the game premise in the creator’s voice. Case-specific counts and times belong in the experiment notes or tests. Capture actual game movement for footage.

The public project contains the Side B simulations. Earlier research also exercised an Arcade worker schedule in a separately installed engine checkout. [The experiments document](docs/SIMULATIONS.md) records its scope.
