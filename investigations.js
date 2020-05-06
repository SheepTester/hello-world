class Investigations {
  constructor () {}

  getInfo () {
    return {
      id: 'investigations',
      name: 'Investigations',
      
      color1: '#3F51B5',
      color2: '#2196F3',
      color3: '#00BCD4',

      blocks: [
        {
          opcode: 'log',

          blockType: Scratch.BlockType.REPORTER,

          text: 'log [VALUE]',
          arguments: {
            VALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'hello'
            }
          }
        },
        {
          opcode: 'delayReport',

          blockType: Scratch.BlockType.REPORTER,

          text: 'report [VALUE] after [DELAY] seconds',
          arguments: {
            VALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'cool'
            },
            DELAY: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 1
            }
          }
        },
        {
          opcode: 'stringToBoolean',

          blockType: Scratch.BlockType.BOOLEAN,

          text: '[STRING]',
          arguments: {
            STRING: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'true'
            }
          }
        }
      ]
    }
  }

  log ({ VALUE }) {
    console.log(VALUE)
    return VALUE
  }

  delayReport ({ DELAY, VALUE }) {
    return new Promise(resolve => {
      setTimeout(() => resolve(VALUE), DELAY * 1000)
    })
  }

  stringToBoolean({ STRING }) {
    return STRING
  }
}

Scratch.extensions.register(new Investigations())
