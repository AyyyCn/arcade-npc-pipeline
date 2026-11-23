const assert = require("node:assert/strict");
const { chromium } = require("playwright");

(async () => {
  const url = new URL(process.env.DEMO_URL || "http://127.0.0.1:19447/");
  url.search = "pipeline";
  const channel = process.env.BROWSER_CHANNEL;
  const browser = await chromium.launch({
    ...(channel ? { channel } : {}),
    args:
      process.platform === "darwin" && channel
        ? ["--use-angle=metal"]
        : ["--enable-unsafe-swiftshader"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1250, height: 790 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url.href);
    await page.waitForFunction(
      () =>
        window.render_game_to_text && JSON.parse(render_game_to_text()).ready,
    );
    const state = () =>
      page.evaluate(() => JSON.parse(window.render_game_to_text()));
    const run = page.locator("#run-brief");
    await run.click();
    await page.waitForFunction(
      () => JSON.parse(render_game_to_text()).attendance === 37,
    );
    assert.deepEqual((await state()).systems, ["social", "crew", "perception"]);
    await page.getByRole("button", { name: "Delay the messenger" }).click();
    assert.equal((await state()).zones, 1);
    await page.getByRole("button", { name: "Block Ida’s view" }).click();
    const blocked = await state();
    assert.equal(blocked.bins, 2);
    assert.ok(blocked.soundStarts >= blocked.recordReady);
    const text = await page.locator(".pipeline").innerText();
    assert.doesNotMatch(text, /\b(?:37|10|25\.3|36\.8)\b/);
    await page.locator("#pipe-examples").selectOption("1");
    await run.click();
    await page.waitForFunction(
      () => JSON.parse(render_game_to_text()).goal === "find_record",
    );
    assert.deepEqual((await state()).systems, ["perception"]);
    assert.equal(await page.locator("#pipe-delay").isVisible(), false);
    await page.locator("#pipe-examples").selectOption("2");
    await run.click();
    await page.waitForFunction(
      () => JSON.parse(render_game_to_text()).venue === "booked",
    );
    assert.equal((await state()).attendance, 40);
    if ((await state()).live) {
      await page
        .locator("#game-brief")
        .fill("Help me run a concert that just moved to another hall.");
      await run.click();
      await page.waitForFunction(
        () => JSON.parse(render_game_to_text()).venue === "moved",
      );
      await page
        .locator("#game-brief")
        .fill("Make a spaceship engine repair puzzle.");
      await run.click();
      await page.waitForFunction(() =>
        document.querySelector("#pipe-status").textContent.includes("supports"),
      );
      assert.equal((await state()).goal, null);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      "Verified game briefs, connected NPC behavior, replay controls and mobile layout.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
