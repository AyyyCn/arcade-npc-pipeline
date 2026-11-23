import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const story = JSON.parse(
  await readFile(new URL("./film.json", import.meta.url), "utf8"),
);
const base = process.env.DEMO_URL || "http://127.0.0.1:19447/";
const folder =
  process.env.PITCH_FRAMES ||
  (await mkdtemp(join(tmpdir(), "npc-pipeline-film-")));
await mkdir(folder, { recursive: true });
const fps = 24,
  width = 1920,
  height = 1080;
const browser = await chromium.launch({
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
  args:
    process.platform === "darwin"
      ? ["--use-angle=metal", "--disable-background-timer-throttling"]
      : [
          "--enable-unsafe-swiftshader",
          "--disable-background-timer-throttling",
        ],
});
let count = 0;
const moments = [],
  errors = [];
async function open(route) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => 1;
  });
  await page.goto(new URL(route, base).href);
  await page.waitForFunction(
    () =>
      window.render_game_to_text &&
      JSON.parse(window.render_game_to_text()).ready,
    null,
    { polling: 75, timeout: 90000 },
  );
  return page;
}
async function frame(page) {
  const path = join(folder, "f-" + String(count++).padStart(4, "0") + ".jpg");
  await page.screenshot({ path, quality: 91, timeout: 20000 });
}
async function hold(page, frames, speed = 1) {
  for (let i = 0; i < frames; i++) {
    await page.evaluate((ms) => window.advanceTime(ms), (1000 / fps) * speed);
    await frame(page);
  }
}
const state = (page) =>
  page.evaluate(() => JSON.parse(window.render_game_to_text()));
async function opener() {
  const page = await open("?pipeline");
  const live = (await state(page)).live,
    prompt = page.locator("#game-brief");
  moments.push({ chapter: "Game brief", frame: count });
  if (live) {
    await prompt.fill("");
    await prompt.focus();
    await hold(page, 9);
    const text = story.opening.prompt;
    for (let i = 2; i < text.length + 2; i += 2) {
      await prompt.fill(text.slice(0, i));
      await frame(page);
    }
  } else {
    assert.equal(await prompt.inputValue(), story.opening.prompt);
    await hold(page, 23);
  }
  await hold(page, 38);
  const start = live
    ? page.waitForResponse((r) => r.url().endsWith("/game-brief"))
    : null;
  await page.locator("#run-brief").click();
  if (start)
    assert.deepEqual((await (await start).json()).facts, {
      goal: "stage_show",
      venue: "moved",
    });
  await page.waitForFunction(
    () => JSON.parse(window.render_game_to_text()).attendance === 37,
    null,
    { polling: 60 },
  );
  let a = await state(page);
  assert.equal(a.zones, 2);
  assert.deepEqual(a.systems, ["social", "crew", "perception"]);
  await hold(page, 84, 1.5);
  await page.locator("#pipe-delay").click();
  a = await state(page);
  assert.equal(a.attendance, 10);
  assert.equal(a.zones, 1);
  await hold(page, 82, 1.5);
  await page.locator("#pipe-block").click();
  a = await state(page);
  assert.equal(a.bins, 2);
  assert.ok(a.soundStarts >= a.recordReady);
  await hold(page, 62, 1.6);
  await page.close();
}
async function chapter(scene) {
  const page = await open(scene.route);
  if (scene.key === "crew") {
    await page.locator("#apply").evaluate((b) => b.click());
    assert.ok((await state(page)).incident);
  }
  await page.evaluate(
    ({ scene }) => {
      const canvas = document.getElementById(
        scene.key === "social" ? "comparison-view" : "world",
      );
      const shell = document.createElement("div");
      shell.id = "film-surface";
      const head = document.createElement("header");
      head.innerHTML =
        "<b>Arcade</b><span>NPC Pipeline</span><small>Side B · Gameplay</small>";
      const h = document.createElement("h1");
      h.textContent = scene.title;
      const caption = document.createElement("p");
      caption.textContent = scene.caption;
      const fig = document.createElement("figure");
      fig.append(canvas);
      const labels = document.createElement("div");
      labels.className = "film-labels";
      for (const label of scene.labels) {
        const span = document.createElement("strong");
        span.textContent = label;
        labels.append(span);
      }
      fig.append(labels);
      shell.append(head, h, caption, fig);
      document.body.append(shell);
      const st = document.createElement("style");
      st.textContent = `
      #film-surface{box-sizing:border-box!important;position:fixed!important;inset:0;z-index:2147483000;background:#f1f0e8;color:#1d2e26;padding:2.8vh 4.35vw 4.1vh;display:flex!important;flex-direction:column;overflow:hidden;text-align:left;font-family:"Helvetica Neue",Arial,sans-serif}
      #film-surface header{display:flex;align-items:center;gap:1.2vw;flex:none;height:6.1vh;border-bottom:1px solid #a9b2a5}
      #film-surface header b{font-size:2.03vw;letter-spacing:-.065em;font-weight:720}#film-surface header span,#film-surface header small{font-size:1.05vw;font-weight:400;color:#42554a}
      #film-surface header span{padding-left:1.25vw;border-left:1px solid #abb4a8}#film-surface header small{margin-left:auto}
      #film-surface h1{font-size:4.45vw;letter-spacing:-.065em;line-height:1.02;font-weight:600;margin:2.9vh 0 1.1vh;color:#1d2e26}
      #film-surface p{font-size:1.64vw;line-height:1.2;letter-spacing:-.025em;margin:0 0 2.45vh;color:#354b3f;max-width:none}
      #film-surface figure{padding:0;border:0;margin:0;display:block;position:relative;flex:1;min-height:0;overflow:hidden;background:#28352e}
      #film-surface canvas{display:block!important;position:relative!important;inset:auto!important;width:100%!important;height:100%!important;margin:0!important}
      #film-surface .film-labels{position:absolute;inset:auto 0 0;display:flex;background:linear-gradient(transparent,#121712cc);color:#faf9f0;padding:5vh 0 2vh;pointer-events:none}
      #film-surface .film-labels strong{width:100%;padding:0 1.3vw;text-align:left;font:600 1.24vw/1.2 "Helvetica Neue",Arial,sans-serif;letter-spacing:-.025em}
    `;
      document.head.append(st);
    },
    { scene },
  );
  moments.push({ chapter: scene.title, frame: count });
  for (let i = 0; i < scene.frames; i++) {
    const tick =
      scene.first + ((scene.last - scene.first) * i) / (scene.frames - 1);
    await page.evaluate(
      ({ key, tick }) => {
        const slider = document.getElementById(
          key === "social" ? "seek" : "scrub",
        );
        slider.value = String(Math.round(tick));
        slider.dispatchEvent(new Event("input"));
        window.advanceTime(0);
      },
      { key: scene.key, tick },
    );
    await frame(page);
  }
  await page.close();
}
try {
  await opener();
  for (const scene of story.scenes) await chapter(scene);
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
const duration = count / fps;
await writeFile(
  join(folder, "chapters.json"),
  JSON.stringify({ fps, count, duration, moments }, null, 2),
);
const output = resolve(
  process.env.PITCH_OUTPUT || join(root, "media", "npc-pipeline.mp4"),
);
const ff = spawnSync(
  "ffmpeg",
  [
    "-v",
    "error",
    "-y",
    "-framerate",
    String(fps),
    "-i",
    join(folder, "f-%04d.jpg"),
    "-stream_loop",
    "-1",
    "-i",
    join(root, "media", "npc-systems.mp4"),
    "-map",
    "0:v",
    "-map",
    "1:a",
    "-vf",
    "scale=in_range=full:out_range=tv,format=yuv420p,setsar=1",
    "-af",
    "volume=0.85,afade=t=in:d=0.35,afade=t=out:st=" +
      (duration - 0.8).toFixed(3) +
      ":d=0.8",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "18",
    "-c:a",
    "aac",
    "-ar",
    "48000",
    "-b:a",
    "160k",
    "-t",
    String(duration),
    "-movflags",
    "+faststart",
    output,
  ],
  { stdio: "inherit" },
);
if (ff.error) throw ff.error;
if (ff.status !== 0) throw new Error("ffmpeg could not write the film.");
console.log(JSON.stringify({ output, count, duration, moments, folder }));
