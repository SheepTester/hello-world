class EvalExtension {
  getInfo () {
    return {
      id: 'eval',
      name: 'JavaScript',

      color1: '#f44336',
      color2: '#e53935',
      color3: '#d32f2f',

      blocks: [
        {
          opcode: 'eval',

          blockType: Scratch.BlockType.REPORTER,

          text: 'run JavaScript [CODE]',
          arguments: {
            CODE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Array.from({ length: 100 }, (_, i) => BigInt(i) + 1n).reduce((a, b) => a * b).toString()'
            }
          }
        }
      ]
    }
  }

  eval ({ CODE }) {
    return eval(CODE)
  }
}

Scratch.extensions.register(new EvalExtension());
