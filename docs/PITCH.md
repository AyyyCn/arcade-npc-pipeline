# NPC Pipeline pitch

## The story

> Make a game about saving a sold-out record shop gig when the venue changes at the last minute.

The creator describes the game. The player needs to get opening night back on track. Guests pass on the new address, the crew prepares for whoever arrives, and the archivist finds the soundcheck record using what she saw. A delay or an obstructed view can change what another character does next.

The film begins with the local model interpreting the game brief. The live simulation shows the stage responding to its audience and the crew waiting for the record. The following scenes show the conversation, handoff and search in play.

## Edit the slide

`pitch/slide.json` contains all slide text, speaker notes, element positions and image references. Its canvas is 1920 by 1080. The stills in `pitch/images/` come from the rendered venue. `media/npc-pipeline.pptx` also has editable PowerPoint text and pictures.

Regenerate the PowerPoint and PNG after changing the source. The slide uses Helvetica Neue. On a machine without it, install the font or update the source’s font family.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r pitch/requirements.txt
.venv/bin/python pitch/slide.py
npm ci
npx playwright install chromium
npm run pitch:png
```

## Edit the film

`pitch/film.json` holds the game prompt and the caption, replay range and duration of each gameplay chapter. `pitch/film.mjs` records the running browser controls and real WebGL canvases. The score comes from the original Side B film. The capture requires FFmpeg and Playwright Chromium or desktop Chrome.

Start the local model and application as described in the README, then run the capture in a second shell.

```sh
DEMO_URL=http://127.0.0.1:19447/ BROWSER_CHANNEL=chrome npm run pitch:film
```

Omit `BROWSER_CHANNEL` for installed Playwright Chromium. The capture prints the location of its JPEG frames and chapter timings. `PITCH_FRAMES` selects a working directory and `PITCH_OUTPUT` selects the output movie. The original case-study film is preserved at `media/npc-systems.mp4`.

In the public static build, the authoring page replays saved model interpretations. To record a freshly interpreted prompt, the local server needs `MODEL_URL`. The remaining behaviors execute in either mode.
