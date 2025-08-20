const DOOR_SHAPE = [
  94, 68, 98, 110, 45, 81, 6, 76, 119, 53, 16, 19, 122, 91, 51, 44, 13, 35, 2,
  124, 83, 101, 75, 122, 75, 124, 37, 8, 127, 0, 22, 130, 11, 42, 114, 19
]

// const cave: number[][] = []
const primes: number[] = []
let number = 1
main: while (primes.length < 36 * 36) {
  number++
  for (const prime of primes) {
    if (number % prime === 0) {
      continue main
    }
  }
  primes.push(number)
  // if (cave.length === 0 || cave[cave.length - 1].length >= 36) {
  //   cave.push([])
  // }
  // cave[cave.length - 1].push(number)
}
// cave.pop()

const code = new TextEncoder().encode(prompt('help') ?? '')
for (let i = 0; i < 36; i++) {
  let sum = 0
  for (let j = 0; j < 36; j++) {
    sum += primes[i * 36 + j] * code[j]
  }
  if (sum % 131 !== DOOR_SHAPE[i]) {
    throw new Error('sad')
  }
}
