class Fetch {
  constructor () {}

  getInfo () {
    return {
      id: 'fetch',
      name: 'Fetch',

      blocks: [
        {
          opcode: 'get',

          blockType: Scratch.BlockType.REPORTER,

          text: 'GET from [URL]',
          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://httpbin.org/get'
            }
          }
        },
        {
          opcode: 'post',

          blockType: Scratch.BlockType.REPORTER,

          text: 'POST [BODY] to [URL]',
          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://httpbin.org/post'
            },
            BODY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Hello'
            }
          }
        }
      ]
    }
  }

  get ({ URL }) {
    return fetch(URL, { method: 'GET' })
      .then(res => res.text())
      .catch(err => '')
  }

  post ({ URL, BODY }) {
    return fetch(URL, { method: 'POST', body: BODY })
      .then(res => res.text())
      .catch(err => '')
  }
}

Scratch.extensions.register(new Fetch())
