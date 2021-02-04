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
        },
        {
          opcode: 'eval',
          blockType: Scratch.BlockType.REPORTER,
          text: 'eval [CODE]',
          arguments: {
            CODE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'undefined'
            }
          }
        }
      ]
    }
  }
    
  null () {
    return null
  }

  eval ({ CODE }) {
    return eval(CODE)
  }
}
  
Scratch.extensions.register(new Null())
