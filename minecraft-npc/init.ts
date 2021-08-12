import { ensureDir } from 'https://deno.land/std@0.102.0/fs/ensure_dir.ts'
import { resolve, toFileUrl } from 'https://deno.land/std@0.102.0/path/mod.ts'
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
  yamlPath: string | URL,
  base: string | URL,
  { namespace = 'minecraft', description = 'Mysterious datapack' } = {}
): Promise<void> {
  const npcData = parse(await Deno.readTextFile(yamlPath))
  const onLoad: Lines = []
  const onTick: Lines = []
  for (const [id, data] of Object.entries(npcData)) {
    const result = toMcfunction(id, data)
    onLoad.push('', result.onLoad)
    onTick.push('', result.onTick)
  }

  // ensureDir expects an absolute path rather than a file:// URL
  await ensureDir(new URL(`./data/${namespace}/functions/`, base).pathname)
  await ensureDir(new URL('./data/minecraft/tags/functions/', base).pathname)

  await Deno.writeTextFile(
    new URL('./pack.mcmeta', base),
    JSON.stringify({ pack: { pack_format: 7, description } }, null, 2)
  )

  await Deno.writeTextFile(
    new URL(`./data/${namespace}/functions/load.mcfunction`, base),
    lines(
      '# Initialise scoreboards',
      'scoreboard objectives add npc-timers dummy',
      'scoreboard objectives add npc-steps dummy',
      '',
      '# Stop all conversations, if possible',
      `tag @a remove spoken-to`,
      onLoad
    )
  )
  await Deno.writeTextFile(
    new URL(`./data/${namespace}/functions/tick.mcfunction`, base),
    lines('# NPC dialogue', onTick)
  )

  await Deno.writeTextFile(
    new URL('./data/minecraft/tags/functions/load.json', base),
    JSON.stringify({ values: [`${namespace}:load`] }, null, 2)
  )
  await Deno.writeTextFile(
    new URL('./data/minecraft/tags/functions/tick.json', base),
    JSON.stringify({ values: [`${namespace}:tick`] }, null, 2)
  )
}

if (import.meta.main) {
  // deno run --allow-all --no-check minecraft-npc/init.ts ./minecraft-npc/simpler.yml /mnt/c/Users/seant/AppData/Roaming/.minecraft/saves/test/datapacks/test-npc-ooga-booga/ -n test-npc -d "aafysfgyudgf goofie"
  const {
    namespace = 'npcs',
    description = 'Generated NPC datapack from a YAML file.',
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
  if (help) {
    console.log(
      'deno run --allow-all minecraft-npc/init.ts [path to yml file] [path to datapack folder] -n [namespace name] -d [description]'
    )
  } else {
    await init(
      toFileUrl(resolve(String(yamlPath))),
      toFileUrl(resolve(String(pathToDatapackFolder)) + '/'),
      {
        namespace,
        description
      }
    )
  }
}
