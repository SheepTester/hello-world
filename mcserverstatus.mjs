import { Client, PacketWriter, State } from 'mcproto'
import fetch from 'node-fetch'

if (process.argv.length < 4) {
  throw new SyntaxError(
    'Please specify the server host and Discord webhook URL.'
  )
}

const [, , serverHost, webhook] = process.argv
const [host, port] = serverHost.split(':')

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

fetch(webhook, {
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: `I update every ten minutes. ${online}/${max} players are on right now.`,
    username: 'iClicker attendance',
    avatar_url: 'https://cravatar.eu/helmavatar/gabrycosta04/64.png',
    embeds: [
      {
        description: '**TheImmortal_Zodd** joined the game.',
        color: 0x22c55e,
        footer: {
          text: '3460ee92-c43c-4cb5-98dc-1589dbedadee'
        },
        thumbnail: {
          url: 'https://cravatar.eu/helmavatar/3460ee92-c43c-4cb5-98dc-1589dbedadee/64.png'
        }
      },
      {
        description: '**TheImmortal_Zodd** left the game.',
        color: 0xef4444,
        footer: {
          text: '3460ee92-c43c-4cb5-98dc-1589dbedadee'
        },
        thumbnail: {
          url: 'https://cravatar.eu/helmavatar/3460ee92-c43c-4cb5-98dc-1589dbedadee/64.png'
        }
      }
    ]
  }),
  method: 'POST'
})

client.end()
