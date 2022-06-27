import { Client, PacketWriter, State } from 'mcproto'
import fetch from 'node-fetch'

if (process.argv.length < 4) {
  throw new SyntaxError(
    'Please specify the server host and Discord webhook URL.'
  )
}

const [, , serverHost, webhook] = process.argv
const [host, port] = serverHost.split(':')

/** @type {Record<string, string>} */
const usernames = {}

/**
 * @returns {{ max: number; online: number; players: string[] }}
 */
async function getStatus () {
  const client = await Client.connect(host, +port || NaN)
  client.send(
    new PacketWriter(0x0)
      .writeVarInt(404)
      .writeString(host)
      .writeUInt16(port)
      .writeVarInt(State.Status)
  )
  client.send(new PacketWriter(0x0))

  const response = await client.nextPacket(0x0)
  const {
    players: { max, online, sample = [] }
  } = response.readJSON()
  client.end()
  for (const { name, id } of sample) {
    usernames[id] = name
  }
  return { max, online, players: sample.map(({ id }) => id) }
}

/**
 * @param {number} online
 * @param {number} max
 * @param {{ name: string; id: string; joined: boolean }[]} changes
 */
async function announce (online, max, changes) {
  if (changes.length > 0) {
    const embeds = changes.map(({ id, name, joined }) => ({
      author: {
        name: `${name} ${joined ? 'joined' : 'left'} the game.`,
        icon_url: `https://cravatar.eu/helmavatar/${id}/64.png`
      },
      color: joined ? 0x22c55e : 0xef4444
    }))
    return fetch(webhook, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `${online}/${Math.max(
          max,
          0
        )} players are on now. I check every five minutes.${
          max === -1 ? ' **NOTE: Server is offline.**' : ''
        }`,
        username: 'iClicker attendance',
        avatar_url: 'https://cravatar.eu/helmavatar/gabrycosta04/64.png',
        embeds
      }),
      method: 'POST'
    })
  }
}

async function check () {
  console.log('Checked', new Date().toLocaleTimeString())
  const status = await getStatus().catch(() => ({
    online: 0,
    max: -1,
    players: []
  }))
  const { online, max, players } = status
  const joined = players.filter(id => !lastPlayers.includes(id))
  const left = lastPlayers.filter(id => !players.includes(id))
  lastPlayers = players
  await announce(online, max, [
    ...joined.map(id => ({ id, name: usernames[id], joined: true })),
    ...left.map(id => ({ id, name: usernames[id], joined: false }))
  ])
}

/**
 * @param {string[]} items
 */
function displayList (items, empty = '') {
  switch (items.length) {
    case 0:
      return empty
    case 1:
    case 2:
      return items.join(' and ')
    default:
      return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
  }
}

const { players } = await getStatus()
let lastPlayers = players

await fetch(webhook, {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: `Hi. I'll be checking attendance now every five minutes. So far, ${displayList(
      players.map(id => `**\`${usernames[id]}\`**`),
      'no one'
    )} ${players.length <= 1 ? 'is' : 'are'} on \`${serverHost}\`.`,
    username: 'iClicker attendance',
    avatar_url: 'https://cravatar.eu/helmavatar/gabrycosta04/64.png'
  }),
  method: 'POST'
})

setInterval(check, 5 * 60_000)
