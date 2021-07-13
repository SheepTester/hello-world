import { Md5, Message } from 'https://deno.land/std@0.95.0/hash/md5.ts'

const md5 = (data: Message) => new Md5().update(data).toString('hex')

const test = new Uint8Array([
  0,   0,  0,   0,   0,   0,   0,   0,   0,
  0,   0,  0,   0,   0,   0,   0,  10,   0,
  0,   0,  0,   0,   0,   0, 104, 101, 108,
108, 111, 32, 108, 111, 108,  10
])

// const m = new Md5().update('lol')
// console.log(m.toString('hex'));
// console.log(m.toString('hex'));
// console.log(m.toString('hex'));
// console.log(m.toString('hex'));
// console.log(m.toString('hex'));

// console.log(test)

const response = await fetch(`https://assets.scratch.mit.edu/${md5(test)}.wav`, {
  "headers": {
    "cookie": "scratchsessionsid=\".[censored]\""
  },
  "body": test,
  "method": "POST",
  credentials: 'include'
});

console.log(response.status)
console.log(await response.text())
const what = await fetch(`https://assets.scratch.mit.edu/${md5(test)}.wav`).then(r => r.arrayBuffer())
console.log(new Uint8Array(what))
