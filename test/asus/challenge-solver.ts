import {
  copy,
  readerFromStreamReader
} from 'https://deno.land/std@0.154.0/streams/conversion.ts'

const magic = 73

const zeroes = Uint8Array.from({ length: magic })
const ones = Uint8Array.from({ length: magic }).fill(0xff)

const K = [
  '\xae@\xb9\x1e\xb5\x98\x97\x81!d\x90\xed\xa9\x0bm~G\x92{y\xcd\x89\x9e\xec2\xb8\x1d\x13OB\x84\xbf\xfaI\xe1o~\x8f\xe40g!%Ri\xda\xd14J\x8aV\xc2x\x1dg\x07K\x1d\xcf\x86{Q\xaa\x00qW\xbb\xe0\xd7\xd8\x9b\x05\x88',
  "Q\xbfF\xe1Jgh~\xde\x9bo\x12V\xf4\x92\x81\xb8m\x84\x862va\x13\xcdG\xe2\xec\xb0\xbd{@\x05\xb6\x1e\x90\x81p\x1b\xcf\x98\xde\xda\xad\x96%.\xcb\xb5u\xa9=\x87\xe2\x98\xf8\xb4\xe20y\x84\xaeU\xff\x8e\xa8D\x1f('d\xfaw",
  "\xc6j\x0b_\x8e\xa1\xee7\x9d8M\xf9\xa2=])WI]'x)w\xc1\xc4-\xab\x06\xff\xbd\x1fi\xdb t\xe1\x9d\x14\x15\x8f\xb3\x03l\xe8\ru\xebm!\xc9\xcbX\n\xf8\x98m\x00\x996\x17\x1a\x04j\xb1&~\xa1\x8d.\xaa\xc7\xa6\x82",
  '9\x95\xf4\xa0q^\x11\xc8b\xc7\xb2\x06]\xc2\xa2\xd6\xa8\xb6\xa2\xd8\x87\xd6\x88>;\xd2T\xf9\x00B\xe0\x96$\xdf\x8b\x1eb\xeb\xeapL\xfc\x93\x17\xf2\x8a\x14\x92\xde64\xa7\xf5\x07g\x92\xfff\xc9\xe8\xe5\xfb\x95N\xd9\x81^r\xd1U8Y}',
  "9\xf8\xd2\x1a\x8d\xa14\xb9X\xccC\xe8\xf5X\x05l:\x8a\xf7\x00\xc4\xeb\x8f.\xb6\xa2\xfb\x9a\xbc?\x8f\x06\xe1\xdbY\xc2\xb2\xc1\x91p%y\xb7\xae/\xcf\x1e\x99r\xcc&$\xf3\x84\x155\x1fu.\xb3\x89\xdc\xbb\xb8\x1f\xfbN'\xe3\x90P\xf1k",
  '\xc6\x07-\xe5r^\xcbF\xa73\xbc\x17\n\xa7\xfa\x93\xc5u\x08\xff;\x14p\xd1I]\x04eC\xc0p\xf9\x1e$\xa6=M>n\x8f\xda\x86HQ\xd00\xe1f\x8d3\xd9\xdb\x0c{\xea\xca\xe0\x8a\xd1Lv#DG\xe0\x04\xb1\xd8\x1co\xaf\x0e\x94'
].map(str => Uint8Array.from(str, char => char.codePointAt(0)!))

/*
out key desired
0   0   0
0   1   1
1   0   1
1   1   0

foo: (variable) (my value) (Kn values) (result)
0 0 00 -> 0
1 0 00 -> 0
0 1 00 -> 0
1 1 00 -> 1

0 0 01 -> 0
1 0 01 -> 1
0 1 01 -> 1
1 1 01 -> 0

0 0 10 -> 0
1 0 10 -> 1
0 1 10 -> 1
1 1 10 -> 0

0 0 11 -> 0
1 0 11 -> 0
0 1 11 -> 0
1 1 11 -> 1

step 2:
key x K3 K4
0   ? 1  2 -> 0
1   ? 1  2 -> 1

step 3:
output key K1 K2
*/

function foo (
  x: Uint8Array,
  y: Uint8Array,
  z: Uint8Array,
  w: Uint8Array
): Uint8Array {
  return x.map((a, i) => {
    const b = y[i]
    const c = z[i]
    const d = w[i]
    return (
      (a & b & c & d) |
      (a & (b ^ 0xff) & (c ^ 0xff) & d) |
      (a & (b ^ 0xff) & c & (d ^ 0xff)) |
      (a & b & (c ^ 0xff) & (d ^ 0xff)) |
      ((a ^ 0xff) & b & (c ^ 0xff) & d) |
      ((a ^ 0xff) & b & c & (d ^ 0xff))
    )
  })
}

/** Flips the requested bits. */
function xor (a: Uint8Array, b: Uint8Array): Uint8Array {
  return a.map((bit, i) => bit ^ b[i])
}

/** Ensures the bit match. */
function xnor (a: Uint8Array, b: Uint8Array): Uint8Array {
  return a.map((bit, i) => bit ^ b[i] ^ 0xff)
}

/** Kills unworthy bits. */
function and (a: Uint8Array, b: Uint8Array): Uint8Array {
  return a.map((bit, i) => bit & b[i])
}

function inputHex (givenBits: string): string {
  const given = Array.from(givenBits, bit => bit === '1')
  let hex = ''
  for (let i = 0; i < magic; i++) {
    // Test if a 1 bit input would work
    // Contains a 1 bit if it passes the test; 0 bit if fail
    let results = ones
    for (const output of [zeroes, ones]) {
      for (const key of [zeroes, ones]) {
        const result = foo(
          output,
          foo(key, foo(ones, given[i] ? ones : zeroes, K[4], K[5]), K[2], K[3]),
          K[0],
          K[1]
        )
        const expected = xor(output, key)
        // Check if each bit produced the correct value
        const passing = xnor(result, expected)
        // Bits must pass all tests
        // results &= passing
        results = and(results, passing)
      }
    }
    // Only has 1 bits for bits that would work as a 1 bit. I'm assuming
    // otherwise, it'd be a 0 bit
    hex += Array.from(results, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  }
  return hex
}

// console.log(inputHex(Deno.args[0]))

// console.log(
//   Array.from({ length: magic * magic })
//     .map(() => ((Math.random() * 0xff) | 0).toString(16).padStart(2, '0'))
//     .join('')
// )

const process = Deno.run({
  cmd: ['nc', 'rev.chal.csaw.io', '5004'],
  // cmd: ['python3', 'challenge.py'],
  stdout: 'piped',
  stdin: 'piped'
})
// Clone stdout for me to see what's going on
const [forDeno, forUser] = process.stdout.readable.tee()
copy(readerFromStreamReader(forUser.getReader()), Deno.stdout)

const readResult = await forDeno.getReader().read()
const randomBits = new TextDecoder().decode(readResult.value).match(/[01]+/)![0]

const myInput = inputHex(randomBits)
await process.stdin.writable
  .getWriter()
  .write(new TextEncoder().encode(myInput + '\n'))

await process.status()
