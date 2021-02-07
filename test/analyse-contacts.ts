// deno run --allow-read --allow-write test/analyse-contacts.ts ~/Downloads/contacts.json ignored/contacts-processed.json
// where contacts.json is from google-contacts-scrape.js

import * as z from 'https://deno.land/x/zod@v3-snapshot-2021-01-21/deno/lib/mod.ts'
import * as colours from 'https://deno.land/std@0.86.0/fmt/colors.ts'

// import { JsonFreqMap } from '../json-freq-map.js'
import { Contact } from './analysed-contacts.ts'

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

const decRegex = /^\d+$/
const hexRegex = /^[\da-f]+$/
const hex6Regex = /^[\dA-F]{6}$/
const weirdBase64 = /^[\da-zA-Z_-]+=*$/
const item1Item21Regex = /^#[\dA-Za-z/]+=*$/
const item25Regex = /^%[\dA-Za-z]+=*$/

const item3BaseSchema = z.tuple([
  // First item is false (if 8-item tuple) or null, second item is true
  z.boolean().nullable(),
  // First item is 0 (8610 people) or 7, second item is 1
  // Correlates with the last field of this tuple (see below).
  z.union([z.literal(0), z.literal(1), z.literal(7)]),
  // second item is null
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  // First item is often null (448 zeroes), second item is null
  z.literal(0).nullable(),
  z.null(),
  // First item is null, second item has some different ID for the contact
  z.string().regex(decRegex).nullable(), // 7xx medium decimal
  z.union([
    // First item has the user ID of the contact
    z.string().regex(decRegex),
    // Second item has hex form of #7 above
    z.string().regex(hexRegex), // medium hex
  ]),
  z.null(),
  z.null(),
  // First item is null, second item is true
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  // First item is 1 or 7, second item is 2
  // Interestingly, 8610 people have 1, but 8162 people have an 8-item tuple as
  // their first item.
  z.union([z.literal(1), z.literal(2), z.literal(7)]),
])
// Item 9 notes for tuple 0 (4, 5, 9, 10, 13 are null for all):
// - Everyone has the first item
// - People whom I know have more than one item
// * Christophers Mahle and Farina are exceptions in their second item
const item9Tuple0Schema = z.tuple([
  // 0: First is null, rest are true*
  z.literal(true).nullable(),
  // 1: First is 7, rest are 1 (or 0*) if true
  z.union([z.literal(0), z.literal(1), z.literal(7)]),
  // 2: First is true, rest are null
  z.literal(true).nullable(),
  // 3: First is null, rest are mostly true (except for seven people)
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  // 6: First is true, rest are almost always null (except for C. Farina's
  // second item)
  z.literal(true).nullable(),
  // 7: First is null, rest are some separate ID for the contact (or null*)
  z.string().regex(decRegex).nullable(),
  // 8: First has user ID for the contact; rest have hex
  z.union([
    z.string().regex(decRegex), // 1xx long decimal
    z.string().regex(hexRegex), // hex
  ]),
  z.null(),
  z.null(),
  // 11: First is true, rest are often null
  z.literal(true).nullable(),
  // 12: First is null, rest are usually a tuple [user ID, 1, true]
  z.tuple([
    z.tuple([
      z.string().regex(decRegex), // 1xx long decimal
      z.literal(1),
      z.literal(true),
    ]),
  ]).nullable(),
  z.null(),
  // 14: First is 7, 2 (or 1*)
  z.union([z.literal(1), z.literal(2), z.literal(7)]),
])
// Other item 9 notes:
// - First item is length 10 for everyone
// - Second item is mostly length 4
// - Other items are length 2
const item9Length10Schema = z.tuple([
  item9Tuple0Schema,
  z.string().email(), // email
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.null(),
  z.literal(1),
  z.tuple([z.literal(true)]),
])
const item9Length4Schema = z.tuple([
  item9Tuple0Schema,
  z.string().email(), // email
  z.union([z.literal('work'), z.literal('home'), z.literal('other')]),
  z.union([z.literal('Work'), z.literal('Home'), z.literal('Other')]),
])
const item9Length2Schema = z.tuple([
  item9Tuple0Schema,
  z.string().email(), // email
])
const item12BaseSchema = z.tuple([
  z.null(),
  // 7 for first item, 0 for rest
  z.union([z.literal(0), z.literal(7)]),
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  // null for first, sometimes rest
  z.literal(0).nullable(),
  z.null(),
  z.null(),
  // ID of the contact
  z.string().regex(decRegex), // 1xx long decimal
  z.null(),
  z.null(),
  // true for first item, null for rest
  z.literal(true).nullable(),
  z.null(),
  z.null(),
  // 7 for first item, 1 for rest
  z.union([z.literal(1), z.literal(7)]),
])

const contactSchema = z.tuple([
  // 0 - User ID of the contact
  z.string().regex(decRegex), // 1xx long decimal
  // 1 - Metadata
  z.tuple([
    z.null(),
    z.null(),
    z.null(),
    // User ID again
    z.string().regex(decRegex), // 1xx long decimal
    z.null(),
    // An array containing the other user ID, only for that group of 204 seen in
    // tuple 21
    z.tuple([
      z.string().regex(decRegex), // 7xx medium decimal
    ]).nullable(),
    z.null(),
    z.null(),
    // ['myContacts'] for 198 people who are definitely in my contacts
    // null for everyone else
    z.tuple([
      z.literal("myContacts"),
    ]).nullable(),
    z.null(),
    z.null(),
    z.literal(true),
    // First item is 1 for everyone
    // Last item is 4 for everyone
    // People in a group of 255 have three items (everyone else has two).
    // - My second item is 3
    // - Other people in this group's second item is 2
    z.array(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])),
    z.null(),
    z.null(),
    // Timestamp that seems to differ from in tuple 21 (in ms)
    z.string().regex(decRegex).nullable(), // a date?
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.null(),
    z.tuple([
      z.null(),
      z.null(),
      // At least 2 items
      // 3 items if in my contacts? (group of 204)
      z.array(z.union([
        // Repetitive because tuples do not work with optional >:(
        z.tuple([
          // First item is 1 if in my contacts else 0
          // Second item is 0 if in my contacts else 7
          // Third item is 7 (only if in my contacts)
          z.union([z.literal(0), z.literal(7)]),
          // User ID of the contact
          z.string().regex(decRegex), // 1xx long decimal
          z.null(),
          z.null(),
          // First item seems to depend on the timestamp above ("#42WmSpB8rSM="
          // for everyone else not in my contacts)
          // Second and third item is "#42WmSpB8rSM=" for everyone
          z.string().regex(item1Item21Regex),
          // Correlates with first field
          // 0 -> 1
          // 1 -> 2
          // 7 -> 7
          z.union([z.literal(1), z.literal(7)]),
        ]),
        // My contacts people (first item)
        // First field (item 0) is always 1
        z.tuple([
          z.literal(1),
          z.string().regex(hexRegex), // 1xx long decimal
          z.null(),
          // A timestamp (in MICROSECONDS since epoch) -- maybe correlated with
          // last email send date with the contact? (including sharing
          // documents) null for most people
          z.number(),
          z.string().regex(item1Item21Regex),
          z.literal(2),
          // A tuple of [seconds, nanosecond] :o
          // Should be the same as the timestamp above
          z.tuple([z.number(), z.number()]),
        ])
      ])),
    ]),
    z.null(),
    z.null(),
    z.literal(1),
  ]),
  // 2 - Names
  z.array(z.tuple([
    z.tuple([
      // true if is me, or my contacts? (correlates with last field--see below)
      z.literal(true).nullable(),
      // 0 - student
      // 7 - staff
      // 1 - me, or my contacts?
      // (correlates with last field--see below)
      z.union([z.literal(0), z.literal(1), z.literal(7)]),
      // First item is true, second item is null
      z.literal(true).nullable(),
      z.null(),
      z.null(),
      // Certain staff (not all--maybe only irregular in second item?) have 0
      z.literal(0).nullable(),
      z.null(),
      // First item is some other ID (if in my contacts?)
      // People with 2 in the last field (see below) will have this set
      // Second item is my ID (except it's the other one that starts with 9)
      // Otherwise, null
      z.string().regex(decRegex).nullable(), // decimal
      z.union([
        // user ID for the contact
        z.string().regex(decRegex), // 1xx long decimal
        // First item of the group of 50 people is a hex of #7 above
        z.string().regex(hexRegex),
      ]),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      // 1 - student
      // 7 - staff
      // 2 - me, or (first item) my contacts?
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
    z.string(), // full name (seemingly same as 1)
  ])),
  // 3 - Profile pictures
  z.array(z.union([
    z.tuple([
      item3BaseSchema,
      z.string().url(), // pfp url
      z.literal(true).nullable(),
      // Seems to be a base64-like ID for the user
      z.string().regex(weirdBase64), // base64 ID
    ]),
    // First item of the array can be 8 items long
    // Second item (of array) is almost always 8 items long, except for Mahle
    // Does not seem to correlate with people without custom profile pictures!
    z.tuple([
      item3BaseSchema,
      // People using the default profile picture can share a URL
      z.string().url(), // pfp url
      z.literal(true),
      z.string().regex(weirdBase64), // base64 ID
      z.null(),
      z.null(),
      z.literal(true),
      // Hexadecimal colour for the default letter profile pictures
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
  // 11 (rare: only Mahle) - phone numbers
  z.array(z.tuple([
    z.tuple([
      // true, 1, true for first item
      // null, 0, null for rest (might imply it's the non-default phone)
      z.literal(true).nullable(),
      z.union([z.literal(0), z.literal(1)]),
      z.literal(true).nullable(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      // not user ID, not date
      z.string().regex(decRegex).nullable(), // 9xx longish decimal
      // hex first item
      // user ID of the contact for rest
      z.union([
        z.string().regex(hexRegex), // hex
        z.string().regex(decRegex), // decimal
      ]),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      // 2 first item
      // 1 rest
      z.union([z.literal(1), z.literal(2)])
    ]),
    z.string(), // phone number with dashes
    z.literal('home'),
    z.string(), // phone number starting with + and with no dashes
    z.literal('Home'),
    z.null(),
    z.string(), // tel: URI
  ])).nullable(),
  // 12: occupation
  z.array(z.union([
    z.tuple([
      item12BaseSchema,
      // only null as first item
      z.string().nullable(), // district/college/school
      // null for all items after first (if any)
      z.string().nullable(), // location (eg school or street address)
      // possibly null after first
      z.string().nullable(), // job title
      z.null(),
      z.null(),
      z.null(),
      // Only one teacher has a description/bio here; others have null
      z.string().nullable(), // job desc/bio (rare)
      z.null(),
      // null for first item, 1/2 for rest
      z.union([z.literal(1), z.literal(2)]).nullable(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      // Work, Work as first item
      // work/school, Work/School for rest
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
      // Next two: (for some teachers' non-first item) years (when hired?), in
      // milliseconds since epoch.
      z.string().regex(decRegex).nullable(), // 1xx medium decimal
      z.string().regex(decRegex), // 1xx medium decimal
      z.literal(true).nullable(),
      // Next two: years
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
      // year, month, date tuples, except month and date are always January 1st.
      // Presumably, this corresponds with one of the years above.
      z.tuple([z.number(), z.number(), z.number()]).nullable(),
      z.tuple([z.number(), z.number(), z.number()]),
    ]),
    // rare - only one teacher has this
    z.tuple([item12BaseSchema]),
  ])).nullable(),
  // 13 (rare)
  z.array(z.tuple([
    z.tuple([
      z.null(),
      z.literal(0),
      // true for first item; null for rest (if any)
      z.literal(true).nullable(),
      z.null(),
      z.null(),
      // null only if there is more than one item
      z.literal(0).nullable(),
      z.null(),
      z.null(),
      // user ID of the contact
      z.string().regex(decRegex), // 1xx long decimal
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.null(),
      z.literal(1),
    ]),
    // The city is generally in the Bay Area for all 10 teachers' first item
    z.string(), // city
    // true for first item; null for rest (if any)
    // `true` might indicate whether the city is current.
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

const slice = json // .slice(0, 100)

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
      case 'invalid_string': {
        display += indent + `Expected it to match ${suberror.validation}\n`
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
  const rawContacts: RawContact[] = result.data

  const contacts: Contact[] = []
  for (const contact of rawContacts) {
    const group204 = contact[1][21][2].find(group204 => group204[0] === 1)
    contacts.push({
      id: contact[0],
      metadata: {
        otherId: contact[1][5] ? contact[1][5][0] : undefined,
        inMyContacts: contact[1][8] !== null,
        group254: contact[1][12].includes(2),
        isMe: contact[1][12].includes(3),
        timestamp: contact[1][15] ?? undefined,
        group204: group204 && group204[3] !== null ? {
          timestamp: group204[3],
          encodedTimestamp: group204[4],
        } : undefined,
      },
      names: contact[2].map(name => ({
        type: name[0][1],
        isFirst: name[0][2] !== null,
        fullName: name[1],
        firstName: name[3],
        lastName: name[4] ?? undefined,
        lastFirstName: name[12],
        certainStaff: name[0][5] === 0,
        group50: name[0][14] === 2 && name[0][7] !== null ? {
          otherId: name[0][7],
          hex: name[0][8],
        } : undefined,
      })),
      pfps: contact[3].map(pfp => ({
        type: pfp[0][1],
        isZero: pfp[0][5] === 0,
        otherId: pfp[0][0] && pfp[0][7] !== null ? {
          id: pfp[0][7],
          hex: pfp[0][8],
        } : undefined,
        url: pfp[1],
        base64: pfp[3],
        colour: pfp[7],
      })),
      emails: contact[9].map(email => ({
        type: email[0][1],
        email: email[1],
        emailType: email[2] ?? undefined,
      })),
      phones: contact[11]?.map(phone => ({
        strangeId: phone[0][7] ?? undefined,
        hex: phone[0][0] === true ? phone[0][8] : undefined,
        dashedPhone: phone[1],
        plusPhone: phone[2],
        phoneUri: phone[6],
      })) ?? [],
      jobs: contact[12]?.map(job => ({
        type: job[0][1],
        location: job[2] ?? job[1] ?? undefined,
        title: job[3] ?? undefined,
        desc: job[7] ?? undefined,
        id: job[9] ?? undefined,
        jobType: job[16] === 'Work' ? 'work' : 'school',
        year: job[27]?.[0],
        yearAlt: job[26]?.[0],
      })) ?? [],
      cities: contact[13]?.map(city => ({
        city: city[1],
        current: city[2] === true,
      })) ?? [],
      group: contact[25],
    })
  }
  if (Deno.args[1]) {
    await Deno.writeTextFile(Deno.args[1], JSON.stringify(contacts, null, '\t'))
  } else {
    // console.log(contacts)
    console.log(contacts.length, 'validated contacts')
  }
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
