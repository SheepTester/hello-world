// deno run --allow-read test/analyse-contacts.ts ~/Downloads/contacts.json
// where contacts.json is from google-contacts-scrape.js

import * as z from 'https://deno.land/x/zod@v3-snapshot-2021-01-21/deno/lib/mod.ts'
import * as colours from 'https://deno.land/std@0.86.0/fmt/colors.ts'

// import { JsonFreqMap } from '../json-freq-map.js'

const filePath = Deno.args[0]
if (!filePath) throw new Error('Give the path to the contacts file please')

const json: any = await Deno.readTextFile(filePath)
  .then(JSON.parse)

// await Deno.writeTextFile('./ignored/contacts-partial.json', JSON.stringify(json.slice(0, 2), null, 2))

// console.log({
//   total: file.length,
//   noNull: file.replace(/null|,/g, '').length,
//   proportionNull: (file.length - file.replace(/null|,/g, '').length) / file.length,
// })

// console.log(JsonFreqMap.analyse(contacts))

// console.log(contacts
//   .filter(item => item[2].length > 1)
//   .map(item => item[2][0][1]))

const decRegex = /\d+/
const hexRegex = /[\da-f]+/
const hex6Regex = /[\dA-F]{6}/
const weirdBase64 = /[\da-zA-Z_-]+=*/
const item1Item21Regex = /#[\dA-Za-z/]+=*/
const item25Regex = /%[\dA-Za-z]+=*/

const item3BaseSchema = z.tuple([
  z.boolean().nullable(),
  z.union([z.literal(0), z.literal(1), z.literal(7)]),
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  z.literal(0).nullable(),
  z.literal(true).nullable(),
  z.string().regex(decRegex).nullable(), // 7xx medium decimal
  z.string().regex(hexRegex).nullable(), // medium hex
  z.null(),
  z.null(),
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  z.union([z.literal(1), z.literal(2), z.literal(7)]),
])
const item9Length10Schema = z.tuple([
  z.tuple([
    z.null(),
    z.literal(7),
    z.literal(true),
    z.null(),
    z.null(),
    z.null(),
    z.literal(true),
    z.null(),
    z.string().regex(decRegex), // 1xx long decimal
    z.null(),
    z.null(),
    z.literal(true),
    z.null(),
    z.null(),
    z.literal(7),
  ]),
  z.string().email(), // email
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.union([z.literal(1), z.literal(2)]),
  z.tuple([z.literal(true)]),
])
const item9Length4Schema = z.tuple([
  z.tuple([
    z.literal(true).nullable(),
    z.union([z.literal(0), z.literal(1)]),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.literal(true).nullable(),
    z.string().regex(decRegex).nullable(), // 2xx medium decimal
    z.string().regex(hexRegex), // hex
    z.null(),
    z.null(),
    z.literal(true).nullable(),
    z.null(),
    z.null(),
    z.union([z.literal(1), z.literal(2)]),
  ]),
  z.string().email(), // email
  z.union([z.literal('work'), z.literal('home'), z.literal('other')]),
  z.union([z.literal('Work'), z.literal('Home'), z.literal('Other')]),
])
const item9Length2Schema = z.tuple([
  z.tuple([
    z.literal(true),
    z.literal(1),
    z.null(),
    z.literal(true).nullable(),
    z.null(),
    z.null(),
    z.null(),
    z.string().regex(decRegex), // 7xx medium or 9xx longish decimal
    z.string().regex(hexRegex), // hex
    z.null(),
    z.null(),
    z.literal(true).nullable(),
    z.tuple([
      z.tuple([
        z.string().regex(decRegex), // 1xx long decimal
        z.literal(1),
        z.literal(true),
      ]),
    ]).nullable(),
    z.null(),
    z.literal(2),
  ]),
  z.string().email(), // email
])
const item12BaseSchema = z.tuple([
  z.null(),
  z.union([z.literal(0), z.literal(7)]),
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  z.literal(0).nullable(),
  z.null(),
  z.null(),
  z.string().regex(decRegex), // 1xx long decimal
  z.null(),
  z.null(),
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  z.union([z.literal(1), z.literal(7)]),
])

const contactSchema = z.tuple([
  // 0
  z.string().regex(decRegex), // 1xx long decimal
  // 1
  z.tuple([
    z.null(),
    z.null(),
    z.null(),
    z.string().regex(decRegex), // 1xx long decimal
    z.null(),
    z.tuple([
      z.string().regex(decRegex), // 7xx medium decimal
    ]).nullable(),
    z.null(),
    z.null(),
    z.tuple([
      z.literal("myContacts"), // 7xx medium decimal
    ]).nullable(),
    z.null(),
    z.null(),
    z.literal(true),
    z.array(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])),
    z.string().regex(decRegex).nullable(), // 1xx medium decimal
    z.null(),
    z.string().regex(decRegex).nullable(), // a date?
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.tuple([
      z.null(),
      z.null(),
      z.array(z.union([
        // Repetitive because tuples do not work with optional >:(
        z.tuple([
          z.union([z.literal(0), z.literal(1), z.literal(7)]),
          z.string().regex(decRegex), // 1xx long decimal
          z.null(),
          z.number().nullable(),
          z.string().regex(item1Item21Regex),
          z.union([z.literal(1), z.literal(2), z.literal(7)]),
        ]),
        z.tuple([
          z.union([z.literal(0), z.literal(1), z.literal(7)]),
          z.string().regex(decRegex), // 1xx long decimal
          z.null(),
          z.number().nullable(),
          z.string().regex(item1Item21Regex),
          z.union([z.literal(1), z.literal(2), z.literal(7)]),
          z.tuple([z.number(), z.number()]),
        ])
      ])),
    ]),
    z.null(),
    z.null(),
    z.literal(1),
  ]),
  // 2
  z.array(z.tuple([
    z.tuple([
      z.literal(true).nullable(),
      z.union([z.literal(0), z.literal(1), z.literal(7)]),
      z.literal(true).nullable(),
      z.null(),
      z.null(),
      z.literal(0).nullable(),
      z.null(),
      z.string().regex(decRegex).nullable(), // decimal
      z.string().regex(decRegex), // 1xx long decimal
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.union([z.literal(1), z.literal(2), z.literal(7)]),
    ]),
    z.string(), // full name
    z.null(),
    z.string(), // first name
    z.string().nullable(), // last name
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.string(), // last name, first name
    z.null(),
    z.null(),
    z.string(), // full name (same as 1)
  ])),
  // 3
  z.array(z.union([
    z.tuple([
      item3BaseSchema,
      z.string().url(), // pfp url
      z.literal(true).nullable(),
      z.string().regex(weirdBase64), // base64 ID
    ]),
    z.tuple([
      item3BaseSchema,
      z.string().url(), // pfp url
      z.literal(true),
      z.string().regex(weirdBase64), // base64 ID
      z.null(),
      z.null(),
      z.literal(true),
      z.string().regex(hex6Regex), // 6 digit hex
    ]),
  ])),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  // 9 - emails
  z.array(z.union([
    item9Length10Schema,
    item9Length4Schema,
    item9Length2Schema,
  ])),
  z.null(),
  // 11 (rare) - phone numbers
  z.array(z.tuple([
    z.tuple([
      z.literal(true).nullable(),
      z.union([z.literal(0), z.literal(1)]),
      z.literal(true).nullable(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.string().regex(decRegex).nullable(), // 9xx longish decimal
      z.string().regex(hexRegex), // hex
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.union([z.literal(1), z.literal(2)])
    ]),
    z.string(), // phone number with dashes
    z.literal('home'),
    z.string(), // phone number starting with + and with no dashes
    z.literal('Home'),
    z.null(),
    z.string(), // tel: URI
  ])).nullable(),
  // 12
  z.array(z.union([
    z.tuple([
      item12BaseSchema,
      z.string().nullable(), // school?
      z.string().nullable(), // location
      z.string().nullable(), // job title
      z.null(),
      z.null(),
      z.null(),
      z.string().nullable(), // job desc/bio (rare)
      z.null(),
      z.union([z.literal(1), z.literal(2)]).nullable(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.union([z.literal('Work'), z.literal('work'), z.literal('school')]),
      z.union([z.literal('Work'), z.literal('School')]),
    ]),
    z.tuple([
      item12BaseSchema,
      z.string().nullable(), // school?
      z.string().nullable(), // location
      z.string().nullable(), // job title
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.union([z.literal(1), z.literal(2)]).nullable(),
      z.string().regex(decRegex).nullable(), // 1xx medium decimal
      z.string().regex(decRegex), // 1xx medium decimal
      z.literal(true).nullable(),
      z.number().nullable(),
      z.number(),
      z.union([z.literal('work'), z.literal('school')]),
      z.union([z.literal('Work'), z.literal('School')]),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.tuple([z.number(), z.number(), z.number()]).nullable(),
      z.tuple([z.number(), z.number(), z.number()]),
    ]),
    // rare
    z.tuple([item12BaseSchema]),
  ])).nullable(),
  // 13 (rare)
  z.array(z.tuple([
    z.tuple([
      z.null(),
      z.literal(0),
      z.literal(true).nullable(),
      z.null(),
      z.null(),
      z.literal(0).nullable(),
      z.null(),
      z.null(),
      z.string().regex(decRegex), // 1xx long decimal
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.literal(1),
    ]),
    z.string(), // address
    z.literal(true).nullable(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.literal('default'),
  ])).nullable(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  // 25
  z.string().regex(item25Regex),
])
const contactsSchema = z.array(contactSchema)

type RawContact = z.infer<typeof contactSchema>

const slice = json

function displayError (error: z.ZodError, indent: string = ''): string {
  let display = ''
  for (const suberror of error.errors) {
    display += indent + `${colours.bold(colours.red(suberror.code))} ${suberror.message}\n`
    let path = ''
    let findable = true
    let value = slice
    for (const key of suberror.path) {
      if (typeof key === 'number') {
        path += `[${key}]`
      } else {
        if (path) path += '.'
        path += key
      }
      if (typeof value === 'object' && value !== null && key in value) {
        value = value[key]
      } else if (findable) {
        findable = false
      }
    }
    display += indent + ` --> ${colours.cyan(path)}\n`
    switch (suberror.code) {
      case 'invalid_type': {
        display += indent + `Expected ${colours.yellow(suberror.expected)}; got ${colours.yellow(suberror.received)}.\n`
        break
      }
      case 'invalid_union': {
        suberror.unionErrors.forEach((error, i) => {
          display += indent + `Option ${i + 1}:\n${displayError(error, indent + '  ')}\n`
        })
        break
      }
    }
    if (findable) {
      display += indent + Deno.inspect(value, {
        depth: 1,
        colors: true, // Anger, something has an out-of-date Deno.InspectOptions
      } as Deno.InspectOptions).replaceAll('\n', '\n' + indent) + '\n'
    } else {
      display += indent + `${colours.blue('Couldn\'t find the problematic value.')}\n`
    }
  }
  return display
}

console.time('Validation')
const result = contactsSchema.safeParse(slice)
console.timeEnd('Validation') // 214755ms
if (result.success) {
  const contacts: RawContact[] = result.data
  // console.log(contacts)
  console.log('Contacts passed!', contacts.length)
} else {
  console.log(displayError(result.error))

  const problematicKeys = new Set(result.error.errors.map(suberror => suberror.path[0]))
  const problematic: { [key: string]: any } = {}
  for (const key of problematicKeys) {
    problematic[key] = slice[key]
  }
  await Deno.writeTextFile('./ignored/contacts-problems.json', JSON.stringify(problematic, null, 2))
    .then(() => {
      console.log(colours.magenta('Problematic contacts written to ignored/contacts-problems.json'))
    })
    .catch(err => {
      if (err instanceof Deno.errors.PermissionDenied) {
        console.log(colours.magenta('Run with --allow-write to save the problematic contacts to a file.'))
      } else {
        throw err
      }
    })
}
