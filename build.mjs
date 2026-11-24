import { build } from "esbuild";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const path = (name) => fileURLToPath(new URL(name, import.meta.url));
const worker = await build({
  entryPoints: [path("comparison/worker.js")],
  bundle: true,
  minify: true,
  write: false,
  platform: "browser",
});
const nightWorker = await build({
  entryPoints: [path("night/worker.js")],
  bundle: true,
  minify: true,
  write: false,
  platform: "browser",
});
const options = {
  entryPoints: [path("entry.js")],
  bundle: true,
  minify: true,
  platform: "browser",
  banner: {
    js:
      "/*!\n" +
      (await readFile(path("THIRD_PARTY_NOTICES.txt"), "utf8")) +
      "\n*/",
  },
  define: {
    CROWD_WORKER_SOURCE: JSON.stringify(worker.outputFiles[0].text),
    NIGHT_WORKER_SOURCE: JSON.stringify(nightWorker.outputFiles[0].text),
  },
  loader: { ".glb": "binary", ".webp": "dataurl", ".html": "text" },
};
const shell = await readFile(path("frame.html"), "utf8");
if (process.argv[2] === "--site") {
  const outdir = resolve(process.argv[3] ?? path("site"));
  const mediaDir = resolve(outdir, "media");
  await mkdir(mediaDir, { recursive: true });
  const { metafile } = await build({
    ...options,
    outdir,
    format: "esm",
    splitting: true,
    metafile: true,
    entryNames: "[name]-[hash]",
    chunkNames: "chunks/[name]-[hash]",
  });
  const [entry] = Object.entries(metafile.outputs).find(
    ([, file]) =>
      file.entryPoint && resolve(file.entryPoint) === path("entry.js"),
  );
  const html = shell.replace(
    /<script>\s*\/\* GAME \*\/\s*<\/script>/,
    '<script type="module" src="./' + basename(entry) + '"></script>',
  );
  await Promise.all([
    writeFile(resolve(outdir, "index.html"), html),
    writeFile(resolve(outdir, ".nojekyll"), ""),
    copyFile(
      path("media/npc-pipeline.mp4"),
      resolve(mediaDir, "npc-pipeline.mp4"),
    ),
    copyFile(
      path("media/npc-pipeline.png"),
      resolve(mediaDir, "npc-pipeline.png"),
    ),
    copyFile(
      path("media/npc-pipeline.pptx"),
      resolve(mediaDir, "npc-pipeline.pptx"),
    ),
  ]);
} else {
  const built = await build({ ...options, write: false });
  await writeFile(
    process.argv[2] || path("play.html"),
    shell.replace("/* GAME */", () =>
      built.outputFiles[0].text.replace(/<\/script/gi, "<\\/script"),
    ),
  );
}
