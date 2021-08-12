import * as z from 'https://deno.land/x/zod@v3.5.1/mod.ts'
import * as YAML from 'https://deno.land/std@0.101.0/encoding/yaml.ts'

const colourNameSchema = [
  z.literal('black'),
  z.literal('dark_blue'),
  z.literal('dark_green'),
  z.literal('dark_aqua'),
  z.literal('dark_red'),
  z.literal('dark_purple'),
  z.literal('gold'),
  z.literal('gray'),
  z.literal('dark_gray'),
  z.literal('blue'),
  z.literal('green'),
  z.literal('aqua'),
  z.literal('red'),
  z.literal('light_purple'),
  z.literal('yellow'),
  z.literal('white')
] as const
const colourNames = colourNameSchema.map(schema => schema.value)

const schema = z
  .object({
    name: z.string(),
    colour: z.union([
      z
        .string()
        .regex(
          /^[0-9a-f]{6}$/i,
          'Custom colours must be 6-digit hex colour codes (case insensitive) without the #.'
        )
        .transform(hex => `#${hex}`),
      ...colourNameSchema
    ]),
    position: z
      .string()
      .regex(
        /^-?\d+ -?\d+ -?\d+$/i,
        'Positions must be a triplet of signed integers.'
      )
      .transform((triplet): [number, number, number] => {
        const [x, y, z] = triplet.split(' ').map(Number)
        return [x, y, z]
      }),
    head: z.string(),
    villager: z.object({
      type: z.union([
        z.literal('desert'),
        z.literal('jungle'),
        z.literal('plains'),
        z.literal('savanna'),
        z.literal('snow'),
        z.literal('swamp'),
        z.literal('taiga')
      ]),
      profession: z.union([
        z.literal('armorer'),
        z.literal('butcher'),
        z.literal('cartographer'),
        z.literal('cleric'),
        z.literal('farmer'),
        z.literal('fisherman'),
        z.literal('fletcher'),
        z.literal('leatherworker'),
        z.literal('librarian'),
        z.literal('nitwit'),
        z.literal('none'),
        z.literal('mason'),
        z.literal('shepherd'),
        z.literal('toolsmith'),
        z.literal('weaponsmith')
      ]),
      level: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(99)
      ])
    }),
    dialogue: z.array(
      z.object({
        mark: z.string().optional(),
        if: z.string().optional(),
        messages: z.array(z.string())
      })
    )
  })
  .strict()
  .deepPartial()

export type Npc = z.infer<typeof schema>

const recordSchema = z.record(schema)

export function parse (yaml: string): Record<string, Npc> {
  return recordSchema.parse(YAML.parse(yaml))
}
