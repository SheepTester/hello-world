const mc = require('minecraft-protocol')
const server = mc.createServer({
  'online-mode': true,   // optional
  encryption: true,      // optional
  host: '0.0.0.0',       // optional
  port: 10068,           // optional
  version: '1.16.3'
})
const mcData = require('minecraft-data')(server.version)

// https://wiki.vg/Protocol#Position
const pos = (x, y, z) => ((x & 0x3FFFFFF) << 38) | ((z & 0x3FFFFFF) << 12) | (y & 0xFFF)

server.on('login', client => {
  
  const loginPacket = mcData.loginPacket

  client.write('login', {
    entityId: client.id,
    isHardcore: false,
    gameMode: 1,
    previousGameMode: 255,
    worldNames: loginPacket.worldNames,
    dimensionCodec: loginPacket.dimensionCodec,
    dimension: loginPacket.dimension,
    worldName: 'minecraft:overworld',
    hashedSeed: [0, 0],
    maxPlayers: server.maxPlayers,
    viewDistance: 10,
    reducedDebugInfo: false,
    enableRespawnScreen: true,
    isDebug: false,
    isFlat: false
  })
  client.write('position', {
    x: 0,
    y: 1.62,
    z: 0,
    yaw: 0,
    pitch: 0,
    flags: 0x00
  })
  /*
  client.write('spawn_entity', {
    entityId: 3,
    objectUUID: '9b9e604a-ec87-4f4a-b02f-942e3ffb99e5',
    // type: 'mob',
    x: 0,
    y: 1,
    z: 5,
    pitch: 0,
    yaw: 0,
    objectData: 0,
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0
  })*/
  /*
  client.write('spawn_entity_experience_orb', {
    entityId: 3,
    x: 0,
    y: 5,
    z: 1,
    count: 3
  })
  */
  /*client.write('boss_bar', {
    entityUUID: '9b9e604a-ec87-4f4a-b02f-942e3ffb99e5',
    action: 2,
    health: 0.5
  })*/
  const msg = {
    translate: 'chat.type.announcement',
    "with": [
      'Server',
      'sheep §lGREETS!'
    ]
  }
  client.write("chat", { message: JSON.stringify(msg), position: 0, sender: '0' })
  /*client.write('open_window', {
    windowId: 0,
    inventoryType: 0,
    windowTitle: 'lol'
  })*/
  client.write('explosion', {
    x: 0,
    y: 1,
    z: 0,
    radius: 5,
    affectedBlockOffsets: [],
    playerMotionX: 0,
    playerMotionY: 1,
    playerMotionZ: 0
  })
  client.write('block_change', {
    location: pos(0, 5, 0),
    type: 46
  })/*
  client.write('map_chunk', {
    x: 0,
    z: 0,
    groundUp: true,
    ignoreOldData: true,
    bitMap: 1,
    */
})

