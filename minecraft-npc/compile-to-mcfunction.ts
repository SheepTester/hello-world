import { Lines } from './init.ts'
import { Npc } from './parse-yaml.ts'

type NbtData = {
  [key: string]: string | number | boolean | NbtData | undefined | null
}

function toSnbt (nbt: NbtData): string {
  const values = []
  for (const [key, value] of Object.entries(nbt)) {
    if (value === undefined || value === null) continue
    values.push(
      `${key}: ${
        typeof value === 'string' || typeof value === 'number'
          ? value
          : typeof value === 'boolean'
          ? value
            ? '1b'
            : '0b'
          : toSnbt(value)
      }`
    )
  }
  return values.length ? `{ ${values.join(', ')} }` : '{}'
}

function rawJson (json: unknown): string {
  return `'${JSON.stringify(json).replace(/['\\]/g, match =>
    match === "'" ? "\\'" : '\\\\'
  )}'`
}

export function toMcfunction (
  namespace: string,
  id: string,
  {
    name,
    colour,
    head,
    position: [x, y, z] = [0, 0, 0],
    villager: {
      type = 'plains',
      profession = 'none',
      // Level 99 hides the villager level in the trading UI
      level = 99
    } = {},
    dialogue = []
  }: Npc
): {
  reset: Lines
  onLoad: Lines
  onTick: Lines
  functions: Record<string, Lines>
} {
  const npcTag = `npc-${id}`
  const playerTag = `victim-of-dialogue-by-${id}`
  // Prevent the dialogue from immediately restarting
  const formerPlayerTag = `former-victim-of-dialogue-by-${id}`

  const START_DIST = 4
  const LEAVE_DIST = 10
  const HEAR_DIST = 25

  const select = {
    self: `@e[tag=${npcTag}, limit=1]`,
    notSpeaking: `@e[tag=${npcTag}, tag=!speaking, limit=1]`,
    speaking: `@e[tag=${npcTag}, tag=speaking, limit=1]`,

    player: `@a[tag=${playerTag}, limit=1]`,
    newPlayer: `@a[tag=${playerTag}, tag=!spoken-to, limit=1]`,
    eavesdropper: `@a[distance=..${HEAR_DIST}]`
  }

  const functions: Record<string, Lines> = {}

  return {
    reset: [
      `# Summon the villager for ${id}.`,
      // Summon new villager
      `summon minecraft:villager ${x} ${y} ${z} ${toSnbt({
        Silent: true,
        Invulnerable: true,
        CustomNameVisible: !!name,
        // `npc` tag is unused but might be nice to kill all NPCs
        Tags: `["npc", "${npcTag}"]`,
        CustomName: name
          ? rawJson({ text: name, color: colour, bold: true })
          : null,
        ArmorItems: head
          ? `[{}, {}, {}, ${toSnbt({
              id: '"minecraft:player_head"',
              Count: '1b',
              tag: {
                SkullOwner: {
                  // The Id can be 0, 0, 0, 0 (non-unique) apparently, even with
                  // different heads
                  Id: '[I; 0, 0, 0, 0]',
                  Properties: {
                    textures: `[{ Value: "${head}" }]`
                  }
                }
              }
            })}]`
          : null,
        VillagerData: {
          type: `"minecraft:${type}"`,
          profession: `"minecraft:${profession}"`,
          level: level
        },
        // `Offers` is empty to prevent trading
        Offers: '{}'
      })}`
    ],
    onLoad: [
      // Reset conversations, if possible (player may be offline)
      `tag @a remove ${playerTag}`,
      `tag @a remove ${formerPlayerTag}`
    ],
    onTick: [
      `# Dialogue for ${id}`,
      dialogue.map(({ messages }) => {
        const indexToFuncName = (i: number) =>
          `dialogue-${id}-${i
            .toString()
            .padStart(String(messages.length - 1).length, '0')}`
        for (const [i, message] of messages.entries()) {
          // # of vowels (≈ syllables) * 5 ticks/vowel
          const duration = (message.match(/[aiueo]/gi)?.length ?? 0) * 5
          functions[indexToFuncName(i)] = [
            `# Dialogue line #${i + 1}: speak and make noise.`,
            `execute at ${select.self} run tellraw ${
              select.eavesdropper
            } ${JSON.stringify([
              '<',
              { text: name || 'Passerby', color: colour, bold: true },
              `> ${message}`
            ])}`,
            `execute at ${select.self} run playsound minecraft:entity.villager.ambient player ${select.eavesdropper}`,
            `schedule function ${namespace}:funcs/${
              i === messages.length - 1
                ? `dialogue-${id}-end`
                : indexToFuncName(i + 1)
            } ${duration}t`
          ]
        }
        functions[`dialogue-${id}-end`] = [
          '# Handle the end of the conversation.',
          // No `limit=1` just in case there are multiple players with the tag
          `tag ${select.player} add ${formerPlayerTag}`,
          `tag @a[tag=${playerTag}] remove spoken-to`,
          `tag @a[tag=${playerTag}] remove ${playerTag}`,
          `tag ${select.self} remove speaking`
        ]
        return [
          '',
          `# Mark players who have ditched the NPC as viable for re-conversation.`,
          `execute at ${select.notSpeaking} run tag @a[tag=${formerPlayerTag}, distance=${LEAVE_DIST}..] remove ${formerPlayerTag}`,
          '',
          "# Start a conversation if it can and hasn't already.",
          // TODO: Consider `mark` and `if`
          `execute at ${select.notSpeaking} run tag @a[tag=!spoken-to, tag=!${formerPlayerTag}, distance=..${START_DIST}, sort=nearest, limit=1] add ${playerTag}`,
          `execute if entity ${select.newPlayer} run tag ${select.self} add speaking`,
          `execute if entity ${
            select.newPlayer
          } run schedule function ${namespace}:funcs/${indexToFuncName(0)} 1t`,
          `tag ${select.newPlayer} add spoken-to`,
          ''
        ]
      }),
      '',
      '# While in a conversation, make eye contact with the player.',
      `execute as ${select.speaking} at @s run tp @s ~ ~ ~ facing entity ${select.player}`
    ],
    functions
  }
}
