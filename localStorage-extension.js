importScripts('https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.min.js')

class LocalStorage {
  constructor () {}

  getInfo () {
    return {
      id: 'localstorage',
      name: 'LocalStorage',

      blocks: [
        {
          opcode: 'readLocalStorage',

          blockType: Scratch.BlockType.REPORTER,

          text: '[NAME]',
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'highscore'
            }
          }
        },
        {
          opcode: 'setLocalStorage',

          blockType: Scratch.BlockType.COMMAND,

          text: 'set [NAME] to [VALUE]',
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'highscore'
            },
            VALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '12'
            }
          }
        }
      ]
    }
  }

  readLocalStorage ({ NAME }) {
    return localforage.getItem(NAME) || ''
  }

  setLocalStorage ({ NAME, VALUE }) {
    return localforage.setItem(NAME, VALUE)
  }
}

Scratch.extensions.register(new LocalStorage())
