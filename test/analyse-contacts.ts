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
const weirdBase64 = /[\da-zA-Z=_-]+/

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
const item9BaseSchema = z.tuple([
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
    z.array(z.union([z.literal(1), z.literal(2), z.literal(4)])),
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
          z.enum(['#42WmSpB8rSM=', '#72/qfAxTj2E=']),
          z.union([z.literal(1), z.literal(2), z.literal(7)]),
        ]),
        z.tuple([
          z.union([z.literal(0), z.literal(1), z.literal(7)]),
          z.string().regex(decRegex), // 1xx long decimal
          z.null(),
          z.number().nullable(),
          z.enum(['#42WmSpB8rSM=', '#72/qfAxTj2E=']),
          z.union([z.literal(1), z.literal(2), z.literal(7)]),
          z.tuple([z.literal(1602784942), z.literal(102000000)]),
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
  // 9
  z.union([
    z.tuple([item9BaseSchema]),
    z.tuple([
      item9BaseSchema,
      z.tuple([
        z.tuple([
          z.literal(true),
          z.literal(1),
          z.null(),
          z.literal(true),
          z.null(),
          z.null(),
          z.null(),
          z.string().regex(decRegex), // 7xx medium decimal
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
          ]),
          z.null(),
          z.literal(2),
        ]),
        z.string().email(), // email
      ]),
    ]),
  ]),
  z.null(),
  z.null(),
  // 12
  z.array(z.tuple([
    z.tuple([
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
    ]),
    z.string().nullable(),
    z.string().nullable(), // location
    z.string().nullable(), // job title
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.literal(1).nullable(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.union([z.literal('Work'), z.literal('work')]),
    z.literal('Work'),
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
  z.null(),
  // 25
  z.union([
    z.literal('%Eg4BAgMJPgoLPwwPEBMmLxoEAQIHCA=='),
    z.literal('%Eg4BAgMJPgoLPwwPEBMmLxoEAQIHCCIMNzIvcWZBeFRqMkU9'),
  ]),
])
const contactsSchema = z.array(contactSchema)

type RawContact = z.infer<typeof contactSchema>

function displayError (error: z.ZodError, indent: string = ''): string {
  let display = ''
  for (const suberror of error.errors) {
    display += indent + `${colours.bold(colours.red(suberror.code))} ${suberror.message}\n`
    let path = ''
    let findable = true
    let value = json
    for (const key of suberror.path) {
      if (typeof key === 'number') {
        path += `[${key}]`
      } else {
        if (path) path += '.'
        path += key
      }
      if (key in value) {
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

const result = contactsSchema.safeParse(json.slice(0, 2400))
if (result.success) {
  const contacts: RawContact[] = result.data
  // console.log(contacts)
  console.log('Contacts passed!', contacts.length)
} else {
  console.log(displayError(result.error))

  const problematicKeys = new Set(result.error.errors.map(suberror => suberror.path[0]))
  const problematic: { [key: string]: any } = {}
  for (const key of problematicKeys) {
    problematic[key] = json[key]
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
