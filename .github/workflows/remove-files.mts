import fs from "fs/promises";
import path from "path";

async function walk(dir: Buffer) {
  for (const d of await fs.readdir(".", { encoding: "buffer" })) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield * walk(entry);
    else if (d.isFile()) yield entry;
  }
  for await (const d of await fs.opendir(dir, { encoding: "buffer" })) {
  }
}
