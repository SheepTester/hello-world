import fs from "fs/promises";
import path from "path";

const extensions = new Set<string | null>();

// assumes the *.oof files were removed
async function walk(dir: string) {
  // https://gist.github.com/lovasoa/8691344
  for await (const d of await fs.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) {
      await walk(entry);
    } else if (d.isFile()) {
      const extension = d.name.includes(".")
        ? d.name.split(".").at(-1) ?? null
        : null;
      extensions.add(extension);
    }
  }
}

await walk(".");
console.log(
  Array.from(extensions, (a) => (a === null ? "<none>" : a))
    .sort()
    .join(" · ")
);
