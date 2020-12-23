const fs = require('fs/promises')
const { Parser, Grammar } = require('nearley')
const grammar = require('./test.js')

async function main () {
  const input = await fs.readFile('./day-19-input.txt', 'utf8')
  let [, msgs] = input.trim().split(/\r?\n\r?\n/)
  msgs = msgs.split(/\r?\n/)

  function test (msg) {
      const parser = new Parser(Grammar.fromCompiled(grammar))
try {
  parser.feed(msg)
  if (parser.results.length > 1) console.log(parser.results)
  return parser.results.length === 1
} catch (err) {
  // throw err
  console.log(err);
  return false
}
}
console.log(msgs.filter(test).length)

}

main()
