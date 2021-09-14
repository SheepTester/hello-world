import mcproto from 'mcproto'
const { Client, PacketWriter, State } = mcproto

const host = 'gunnmc.softether.net'
const port = 42015

async function main () {
  const client = await Client.connect(host, port)

  client.send(new PacketWriter(0x0).writeVarInt(404)
    .writeString(host).writeUInt16(port)
    .writeVarInt(State.Status))

  client.send(new PacketWriter(0x0))

  const response = (await client.nextPacket(0x0)).readJSON()
  console.log(response, response.players.sample)

  client.end()
}

main()

