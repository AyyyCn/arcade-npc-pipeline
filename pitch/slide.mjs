import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const source = new URL("./slide.json", import.meta.url);
const slide = JSON.parse(await readFile(source, "utf8"));
const elements = await Promise.all(
  slide.elements.map(async (item) => {
    if (item.kind !== "image") return item;
    const bytes = await readFile(new URL(item.file, source));
    return {
      ...item,
      src: "data:image/jpeg;base64," + bytes.toString("base64"),
    };
  }),
);
const browser = await chromium.launch(
  process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {},
);
try {
  const page = await browser.newPage({
    viewport: { width: slide.width, height: slide.height },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>',
  );
  await page.evaluate(
    ({ slide, elements }) => {
      document.body.style.cssText =
        "margin:0;background:" + slide.background + ";overflow:hidden";
      for (const item of elements) {
        const el = document.createElement(
          item.kind === "image" ? "img" : "div",
        );
        const [x, y, w, h] = item.bounds;
        Object.assign(el.style, {
          position: "absolute",
          left: x + "px",
          top: y + "px",
          width: w + "px",
          height: h + "px",
        });
        if (item.kind === "image") {
          el.src = item.src;
          el.alt = item.alt;
          el.style.objectFit = "cover";
        } else if (item.kind === "shape") {
          el.style.background = item.color;
        } else {
          Object.assign(el.style, {
            fontFamily: '"' + slide.font + '",Arial,sans-serif',
            fontSize: item.fontSize + "px",
            fontWeight: item.bold ? "700" : "400",
            color: item.color,
            whiteSpace: "pre",
            lineHeight: "1.18",
          });
          el.textContent = item.text;
        }
        document.body.append(el);
      }
    },
    { slide, elements },
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode()));
  });
  await page.screenshot({
    path:
      process.env.SLIDE_OUTPUT ||
      fileURLToPath(new URL("../media/npc-pipeline.png", source)),
  });
} finally {
  await browser.close();
}
