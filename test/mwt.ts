// Based on Niema's Python implementation

const isWord = Symbol()
type Node = {
  [char: string]: Node
  [isWord]: boolean
}
class Mwt {
  #root: Node = { [isWord]: false }

  insert (s: string) {
    let curr = this.#root
    for (const c of s) {
      if (!curr[c]) {
        curr[c] = { [isWord]: false }
      }
      curr = curr[c]
    }
    curr[isWord] = true
  }
}

const WORD_SOURCE = 'https://github.com/dwyl/english-words/raw/master/words.txt'
const words = await fetch(WORD_SOURCE)
  .then(r => r.text())
  .then(file => file.trim().split('\n'))
console.log('words obtained')

console.time()
const mwt = new Mwt()
for (const word of words) {
  mwt.insert(word)
}
console.timeEnd()
