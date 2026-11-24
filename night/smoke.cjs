const assert = require("node:assert/strict");
const { chromium } = require("playwright");

// Plays the night in a real browser: the director picks its trouble, the player asks and tells,
// and the outcome has to come from the simulation.
(async () => {
  const url = new URL(process.env.DEMO_URL || "http://127.0.0.1:19447/");
  url.search = "night";
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
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url.href);
    await page.waitForFunction(
      () =>
        window.render_game_to_text && JSON.parse(render_game_to_text()).ready,
      null,
      { timeout: 90000 },
    );
    const state = () =>
      page.evaluate(() => JSON.parse(window.render_game_to_text()));
    const first = await state();
    assert.equal(first.mood, "tense");
    assert.ok(first.held, "the director chose someone to stop");
    assert.equal(first.untouched.saved, false);
    assert.ok(first.rescuers.length >= 1);
    assert.ok(first.nights > 500);

    // A staff member with a wrong belief says so, and an order too early is refused.
    await page.evaluate(() => window.nightJump(10));
    await page.getByRole("button", { name: /^Tell .* the show moved/ }).click();
    assert.equal((await state()).last.kind, "refused");
    await page.evaluate(() => window.nightJump(92));
    await page.locator("#n-input").fill("Nina, where is the show?");
    await page.locator("#n-say button").click();
    await page.waitForFunction(
      () => JSON.parse(render_game_to_text()).last?.kind === "ask",
    );
    assert.match((await state()).last.text, /^West Hall/);

    // One sentence to someone the director listed turns the night around.
    const saver = first.rescuers[0];
    await page.locator("#n-input").fill(saver + ", the show moved to East Hall");
    await page.locator("#n-say button").click();
    await page.waitForFunction(
      () => JSON.parse(render_game_to_text()).orders.length === 1,
    );
    let now = await state();
    assert.equal(now.yours.saved, true);
    assert.ok(now.yours.attendance > now.untouched.attendance);

    // A correction replaces the order, and undo restores the lost night.
    await page.locator("#n-input").fill("Actually, tell " + first.rescuers[1] + " instead");
    await page.locator("#n-say button").click();
    await page.waitForFunction(
      (name) => JSON.parse(render_game_to_text()).orders[0]?.endsWith(name),
      first.rescuers[1],
    );
    assert.equal((await state()).orders.length, 1);
    await page.getByRole("button", { name: "Undo last order" }).click();
    now = await state();
    assert.equal(now.orders.length, 0);
    assert.equal(now.yours.saved, false);

    // Tell again, play to the end and read the result off the page.
    await page.locator("#n-input").fill("tell " + saver + " the show moved");
    await page.locator("#n-say button").click();
    await page.waitForFunction(
      () => JSON.parse(render_game_to_text()).orders.length === 1,
    );
    await page.evaluate(() => window.nightJump(100000));
    await page.locator("#n-result").waitFor();
    assert.match(await page.locator("#n-result").innerText(), /^Night saved/);
    await page.waitForFunction(
      () => JSON.parse(render_game_to_text()).leaks !== null,
    );
    now = await state();
    assert.equal(now.leaks, 0);
    assert.ok(now.answers > 3000);

    // The quiet mood leaves the night alone.
    await page.getByRole("button", { name: "Quiet night" }).click();
    now = await state();
    assert.equal(now.held, null);
    assert.equal(now.untouched.saved, true);
    assert.deepEqual(errors, []);
    console.log("night smoke passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
