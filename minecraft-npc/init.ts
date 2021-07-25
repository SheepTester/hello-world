import { ensureDir } from 'https://deno.land/std@0.102.0/fs/ensure_dir.ts'

export async function init (
  base: URL,
  namespace = 'minecraft',
  description = 'Mysterious datapack'
): Promise<void> {
  await ensureDir(new URL(`./data/${namespace}/functions/`, base).toString())
  await ensureDir(new URL('./data/minecraft/tags/functions/', base).toString())

  await Deno.writeTextFile(
    new URL('./pack.mcmeta', base),
    JSON.stringify({ pack: { pack_format: 7, description } }, null, 2)
  )

  await Deno.writeTextFile(
    new URL(`./data/${namespace}/functions/load.mcfunction`, base),
    ''
  )
  await Deno.writeTextFile(
    new URL(`./data/${namespace}/functions/tick.mcfunction`, base),
    ''
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
