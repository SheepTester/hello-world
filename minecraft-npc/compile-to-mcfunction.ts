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
  return `'${JSON.stringify(json)
    .slice(1, -1)
    .replace(/['\\]/g, match => (match === "'" ? "\\'" : '\\\\'))}'`
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

  return {
    onLoad: [
      `# Reset ${id} villager`,
      // Kill old villager
      `kill @e[type=minecraft:villager, tag=${npcTag}]`,
      // Summon new villager
      `summon minecraft:villager ${x} ${y} ${z} ${toSnbt({
        Silent: true,
        Invulnerable: true,
        CustomNameVisible: !!name,
        // `npc` tag is unused but might be nice to kill all NPCs
        Tags: `["npc", "${npcTag}"]`,
        CustomName: name ? rawJson({ text: name, color: colour }) : null,
        ArmorItems: head
          ? `[{}, {}, {}, ${toSnbt({
              id: '"minecraft:player_head"',
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
          // Start a conversation if it can and hasn't already
          // TODO: Consider `mark` and `if`
          `execute as @e[tag=${npcTag}, tag=!speaking] at @s as @a[tag=!spoken-to, distance=..7, sort=nearest, limit=1] run tag @s add ${playerTag}`,
          `execute if entity @a[tag=${playerTag}, tag=!spoken-to] run tag @e[tag=${npcTag}] add speaking`,
          `execute if entity @a[tag=${playerTag}, tag=!spoken-to] run scoreboard players set ${id} npc-timers 0`,
          // TODO: Also handle different dialogue lines (separate scoreboard?)
          `execute if entity @a[tag=${playerTag}, tag=!spoken-to] run scoreboard players set ${id} npc-steps ${messages.length +
            1}`,
          `tag @a[tag=${playerTag}, tag=!spoken-to] add spoken-to`,
          '',
          `execute as @e[tag=${npcTag}, tag=speaking] at @s run tp @s ~ ~ ~ facing entity @a[type=${playerTag}]`,
          // If the last dialogue finished, then go to the next one
          // TODO: Move this into a function? (Actually might as well move a
          // bunch of a things into their own functions)
          `execute if entity @e[tag=${npcTag}, tag=speaking] if score ${id} npc-timers 0 run scoreboard players remove ${id} npc-steps 1`,
          messages.map((message, i) => {
            const step = messages.length - i
            return [
              `execute if entity @e[tag=${npcTag}, tag=speaking] if score ${id} npc-timers 0 if score ${id} npc-steps ${step} at @e[tag=${npcTag}, tag=speaking] run tellraw @a[distance=..15] ${JSON.stringify(
                [
                  '<',
                  { text: name || 'Passerby', color: colour },
                  `> ${message}`
                ]
              )}`,
              `execute if entity @e[tag=${npcTag}, tag=speaking] if score ${id} npc-timers 0 if score ${id} npc-steps ${step} at @e[tag=${npcTag}, tag=speaking] run playsound minecraft:entity.villager.ambient player @a`,
              // TODO: Message duration
              `execute if entity @e[tag=${npcTag}, tag=speaking] if score ${id} npc-timers 0 if score ${id} npc-steps ${step} run scoreboard players set ${id} npc-timer 60`
            ]
          }),
          // Handle end of conversation
          `execute if entity @e[tag=${npcTag}, tag=speaking] if score ${id} npc-timers 0 if score ${id} npc-steps 0 run tag @a[tag=${playerTag}] remove $spoken-to`,
          `execute if entity @e[tag=${npcTag}, tag=speaking] if score ${id} npc-timers 0 if score ${id} npc-steps 0 run tag @a[tag=${playerTag}] remove ${playerTag}`,
          `execute as @e[tag=${npcTag}, tag=speaking] if score ${id} npc-timers 0 if score ${id} npc-steps 0 run tag @s remove speaking`,
          '',
          `execute as @e[tag=${npcTag}, tag=speaking] run scoreboard players ${id} npc-timers remove 1`
        ]
      })
    ]
  }
}
