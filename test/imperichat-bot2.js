const {ImperichatClient} = require('imperichat-js');

const client = new ImperichatClient()
const taglines = [
  'what a nerd',
  'lmao',
  'wtf',
  'random nonsense',
  'as if',
  'bruh'
]
async function run(){
    await client.login('lXrsirjBfbPBpJZBmewc','piñata u\nau|\n~~~')
    client.onMessage('2814671470',async function (m) {
        //if (m.content.startsWith("!greet")){
            //let list = m.content.split(" ")
            //delete list[0]
            //const pref = list.join(" ")
            //const name = pref==='' ? m.author.displayName : pref
            const id = await client.sendMessage('2814671470', Array.from(
              m.content,
              char => Math.random() < 0.5 ? char.toLowerCase() : char.toUpperCase()
            ).join('') + ' ' + taglines[Math.random() * taglines.length | 0])
            console.log(id)
        //}
    })


}

run()
