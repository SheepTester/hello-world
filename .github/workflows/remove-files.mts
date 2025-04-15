// node --experimental-strip-types .github/workflows/remove-files.mts

import fs from "fs/promises";
import path from "path";

const extensions = new Set<string | null>();

const DELETE = process.argv[2] === "DELETE";

const keep = [
  "css",
  "gif",
  "html",
  "js",
  "json", // presumably fetched by some web pages. other formats like .yml are hard to parse on the web so i assume they won't be needed
  "map", // used by detect-inspect-element, which doesn't work on gh pages, but is referenced by a file that will be deployed
  "md", // Jekyll will process these
  "mjs",
  "mp3",
  "pdf",
  "png",
  "svg",
  "txt",
  "wav",
  "webmanifest",
  "webp",
];

// assumes the *.oof files were removed
async function walk(dir: string, topLevel = false) {
  // https://gist.github.com/lovasoa/8691344
  for await (const d of await fs.opendir(dir)) {
    if (topLevel && d.name === ".git") {
      continue;
    }
    if (!DELETE && d.name === "node_modules") {
      // TEMP
      continue;
    }
    if (DELETE && d.name === "_config.yml") {
      // keep jekyll config file
      continue;
    }
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) {
      await walk(entry);
    } else if (d.isFile()) {
      const extension = d.name.includes(".")
        ? d.name.split(".").at(-1) ?? null
        : null;
      extensions.add(extension);
      if (DELETE && (!extension || !keep.includes(extension))) {
        console.warn(entry);
        await fs.unlink(entry);
      }
    }
  }
}

await walk(".", true);
console.log(
  "extensions:",
  Array.from(extensions, (a) => (a === null ? "<none>" : a))
    .sort()
    .join(" · ")
);
