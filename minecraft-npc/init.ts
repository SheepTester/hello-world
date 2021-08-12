import { ensureDir, emptyDir } from 'https://deno.land/std@0.102.0/fs/mod.ts'
import { join } from 'https://deno.land/std@0.102.0/path/mod.ts'
import { parse as parseArgs } from 'https://deno.land/std@0.104.0/flags/mod.ts'
import { toMcfunction } from './compile-to-mcfunction.ts'
import { parse } from './parse-yaml.ts'

export type Lines = string | Lines[]

function lines (...lines: Lines[]): string {
  function toLines (line: Lines): string {
    if (typeof line === 'string') {
      return line + '\n'
    } else {
      return line.map(line => toLines(line)).join('')
    }
  }
  return toLines(lines)
}

export async function init (
  yamlPath: string,
  basePath: string,
  {
    namespace = 'npc',
    description = 'Generated NPC datapack from a YAML file.'
  } = {}
): Promise<void> {
  const npcData = parse(await Deno.readTextFile(yamlPath))
  const reset: Lines = []
  const onLoad: Lines = []
  const onTick: Lines = []
  const functions: Record<string, Lines> = {}
  for (const [id, data] of Object.entries(npcData)) {
    const result = toMcfunction(namespace, id, data)
    // The empty string is to have an empty between each entry
    reset.push('', result.reset)
    onLoad.push('', result.onLoad)
    onTick.push('', result.onTick)
    Object.assign(functions, result.functions)
  }

  // ensureDir expects an absolute path rather than a file:// URL
  await ensureDir(join(basePath, `./data/${namespace}/functions/`))
  await ensureDir(join(basePath, './data/minecraft/tags/functions/'))

  await Deno.writeTextFile(
    join(basePath, './pack.mcmeta'),
    JSON.stringify({ pack: { pack_format: 7, description } }, null, 2)
  )

  await Deno.writeTextFile(
    join(basePath, `./data/${namespace}/functions/reset.mcfunction`),
    lines(
      '# Kill all existing NPCs.',
      'kill @e[type=minecraft:villager, tag=npc]',
      reset
    )
  )
  await Deno.writeTextFile(
    join(basePath, `./data/${namespace}/functions/load.mcfunction`),
    lines(
      '# Stop all conversations, if possible.',
      `tag @a remove spoken-to`,
      `tag @e[tag=npc] remove speaking`,
      onLoad
    )
  )
  await Deno.writeTextFile(
    join(basePath, `./data/${namespace}/functions/tick.mcfunction`),
    lines('# NPC dialogue', onTick)
  )
  await emptyDir(join(basePath, `./data/${namespace}/functions/funcs/`))
  for (const [name, contents] of Object.entries(functions)) {
    await Deno.writeTextFile(
      join(basePath, `./data/${namespace}/functions/funcs/${name}.mcfunction`),
      lines(contents)
    )
  }

  await Deno.writeTextFile(
    join(basePath, './data/minecraft/tags/functions/load.json'),
    JSON.stringify({ values: [`${namespace}:load`] }, null, 2)
  )
  await Deno.writeTextFile(
    join(basePath, './data/minecraft/tags/functions/tick.json'),
    JSON.stringify({ values: [`${namespace}:tick`] }, null, 2)
  )
}

if (import.meta.main) {
  // deno run --allow-all --no-check minecraft-npc/init.ts ./minecraft-npc/simpler.yml /mnt/c/Users/seant/AppData/Roaming/.minecraft/saves/test/datapacks/test-npc-ooga-booga/ -n test-npc -d "aafysfgyudgf goofie"
  const {
    namespace,
    description,
    help,
    _: [yamlPath, pathToDatapackFolder]
  } = parseArgs(Deno.args, {
    string: ['namespace', 'description'],
    boolean: ['help'],
    alias: {
      n: 'namespace',
      d: 'description',
      h: 'help'
    }
  })
  if (help || !yamlPath || !pathToDatapackFolder) {
    console.log(
      'deno run --allow-read --allow-write https://raw.githubusercontent.com/SheepTester/hello-world/master/minecraft-npc/init.ts [path to yml file] [path to datapack folder] -n [namespace name] -d [description]'
    )
  } else {
    await init(String(yamlPath), String(pathToDatapackFolder), {
      namespace,
      description
    })
  }
}
