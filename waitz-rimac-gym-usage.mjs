// node waitz-rimac-gym-usage.mjs ./ignored/usage.csv

import { open } from 'fs/promises'

/**
 * @typedef {object} Datum
 * @property {null} bestLabel
 * @property {never[]} bestLocations
 * @property {number} busyness
 * @property {number} capacity
 * @property {string} hourSummary
 * @property {number} id
 * @property {boolean} isAvailable
 * @property {boolean} isOpen
 * @property {object} locHtml
 * @property {string} locHtml.class
 * @property {string} locHtml.initial
 * @property {string} locHtml.summary
 * @property {string} name
 * @property {number} people
 * @property {number} percentage
 */

const URL = 'https://waitz.io/live/ucsd'
const locations = ['RIMAC Fitness Gym', 'Main Gym']
const outputPath = process.argv[2]

/** @param {string} flags */
const createStream = flags =>
  open(outputPath, flags).then(fd => fd.createWriteStream())

const stream = await createStream('ax')
  .then(stream => {
    stream.write(
      locations
        .flatMap(location =>
          [
            'datetime',
            'busyness',
            'people',
            'isAvailable',
            'capacity',
            'hourSummary',
            'isOpen',
            'percentage'
          ].map(field => `${location} ${field}`)
        )
        .join(',') + '\n'
    )
    return stream
  })
  .catch(() => {
    // File already exists; don't write a header
    return createStream('a')
  })

/** @param {Date} date */
function displayDate (date) {
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    )
  )
  return utcDate.toISOString().slice(0, 16).replace('T', ' ')
}

async function scrape () {
  /** @type {{ data: Datum[] }} */
  const { data } = await fetch(URL).then(r => r.json())
  const map = new Map(data.map(location => [location.name, location]))
  const fields = [displayDate(new Date())]
  for (const locationName of locations) {
    const location = map.get(locationName)
    fields.push(
      ...[
        location.busyness,
        location.people,
        location.isAvailable,
        location.capacity,
        location.hourSummary,
        location.isOpen,
        location.percentage
      ]
    )
  }
  stream.write(
    fields
      .map(field => (/",\n/.test(field) ? JSON.stringify(field) : field))
      .join(',') + '\n'
  )
}

scrape()
setInterval(scrape, 5 * 60 * 1000)
