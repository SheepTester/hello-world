class Null {
  getInfo () {
    return {
      id: 'null',
      name: 'Null',

      blocks: [
        {
          opcode: 'null',
          blockType: Scratch.BlockType.REPORTER,
          text: 'null'
        }
      ]
    }
    
    null () {
      return null
    }
  }
  
  Scratch.extensions.register(new Null())
