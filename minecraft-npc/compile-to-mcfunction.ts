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
): { onLoad: Lines; onTick: Lines } {
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

  return {
    onLoad: [
      `# Reset the villager for ${id}.`,
      // Kill old villager
      `kill @e[type=minecraft:villager, tag=${npcTag}]`,
      // Reset conversations, if possible (player may be offline)
      `tag @a remove ${playerTag}`,
      `tag @a remove ${formerPlayerTag}`,
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
    onTick: [
      `# Dialogue for ${id}`,
      dialogue.map(({ messages }) => {
        return [
          '',
          `# Mark players who have ditched the NPC as viable for re-conversation.`,
          `execute at ${select.notSpeaking} run tag @a[tag=${formerPlayerTag}, distance=${LEAVE_DIST}..] remove ${formerPlayerTag}`,
          '',
          "# Start a conversation if it can and hasn't already.",
          // TODO: Consider `mark` and `if`
          `execute at ${select.notSpeaking} run tag @a[tag=!spoken-to, tag=!${formerPlayerTag}, distance=..${START_DIST}, sort=nearest, limit=1] add ${playerTag}`,
          `execute if entity ${select.newPlayer} run tag ${select.self} add speaking`,
          `execute if entity ${select.newPlayer} run scoreboard players set ${id} npc-timers 0`,
          // TODO: Also handle different dialogue lines (separate scoreboard?)
          `execute if entity ${
            select.newPlayer
          } run scoreboard players set ${id} npc-steps ${messages.length + 1}`,
          `tag ${select.newPlayer} add spoken-to`,
          '',
          '# While in a conversation, make eye contact with the player.',
          `execute as ${select.speaking} at @s run tp @s ~ ~ ~ facing entity ${select.player}`,
          '',
          '# If the last line of dialogue finished, continue to the next one.',
          // TODO: Move this into a function? (Actually might as well move a
          // bunch of a things into their own functions)
          `execute if entity ${select.speaking} if score ${id} npc-timers matches 0 run scoreboard players remove ${id} npc-steps 1`,
          messages.map((message, i) => {
            const step = messages.length - i
            // TODO: Configurable hearing distance?
            return [
              '',
              `# Dialogue line #${i + 1}`,
              `execute if entity ${
                select.speaking
              } if score ${id} npc-timers matches 0 if score ${id} npc-steps matches ${step} at ${
                select.speaking
              } run tellraw ${select.eavesdropper} ${JSON.stringify([
                '<',
                { text: name || 'Passerby', color: colour, bold: true },
                `> ${message}`
              ])}`,
              `execute if entity ${select.speaking} if score ${id} npc-timers matches 0 if score ${id} npc-steps matches ${step} at ${select.speaking} run playsound minecraft:entity.villager.ambient player ${select.eavesdropper}`,
              // TODO: Message duration
              `execute if entity ${select.speaking} if score ${id} npc-timers matches 0 if score ${id} npc-steps matches ${step} run scoreboard players set ${id} npc-timers 60`
            ]
          }),
          '',
          '# Handle the end of the conversation.',
          // No `limit=1` just in case there are multiple players with the tag
          `execute if entity ${select.speaking} if score ${id} npc-timers matches 0 if score ${id} npc-steps matches 0 run tag @a[tag=${playerTag}] remove spoken-to`,
          `execute if entity ${select.speaking} if score ${id} npc-timers matches 0 if score ${id} npc-steps matches 0 run tag ${select.player} add ${formerPlayerTag}`,
          `execute if entity ${select.speaking} if score ${id} npc-timers matches 0 if score ${id} npc-steps matches 0 run tag @a[tag=${playerTag}] remove ${playerTag}`,
          `execute as ${select.speaking} if score ${id} npc-timers matches 0 if score ${id} npc-steps matches 0 run tag @s remove speaking`,
          '',
          '# Decrement the timer per tick while speaking.',
          `execute as ${select.speaking} run scoreboard players remove ${id} npc-timers 1`
        ]
      })
    ]
  }
}
