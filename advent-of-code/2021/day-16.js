// Part 1: found out that had to parse literals 😔
;bits = document.body.textContent
.trim().split('').flatMap(char => parseInt(char, 16).toString(2).padStart(4, 0).split('')).join('')
let t = 0
parse = (start) => {
const version = parseInt(bits.slice(start, start += 3), 2)
t += version
const type = parseInt(bits.slice(start, start += 3), 2)
const packets = []
if (type === 4) {
let value = ''
while (true) {
const hayMas = bits[start++] === '1'
value += bits.slice(start, start += 4)
if (!hayMas) break
}

} else {
const lengthid = bits[start++]
if (lengthid === '0') {
const length = parseInt(bits.slice(start, start += 15), 2)
const end = start + length
while (start < end) {
  ;({ start, ...packet } = parse(start))
  packets.push(packet)
}
} else {
const packetCount = parseInt(bits.slice(start, start += 11), 2)
while (packets.length < packetCount) {
  ;({ start, ...packet } = parse(start))
  packets.push(packet)
}
}
}
return { version, type, start, packets }
}
parse(0)

// Part 2
;bits = document.body.textContent
.trim().split('').flatMap(char => parseInt(char, 16).toString(2).padStart(4, 0).split('')).join('')
let t = 0
parse = (start) => {
const version = parseInt(bits.slice(start, start += 3), 2)
t += version
const type = parseInt(bits.slice(start, start += 3), 2)
if (type == 4) {
let valueBit = ''
while (true) {
const hayMas = bits[start++] == '1'
valueBit += bits.slice(start, start += 4)
if (!hayMas) break
}
let value = parseInt(valueBit, 2)
return { start, value }
} else {
let v
const values = []
const lengthid = bits[start++]
if (lengthid == '0') {
const length = parseInt(bits.slice(start, start += 15), 2)
const end = start + length
while (start < end) {
  ;({ start, value: v } = parse(start))
  values.push(v)
}
} else {
const packetCount = parseInt(bits.slice(start, start += 11), 2)
while (values.length < packetCount) {
  ;({ start, value: v } = parse(start))
  values.push(v)
}
}
let value
switch (type) {
  case 0: { value = values.reduce((a, b) => a + b, 0) ; break} // sum
  case 1: { value = values.reduce((a, b) => a * b, 1) ; break} // prod
  case 2: { value = Math.min(...values) ; break} // min
  case 3: { value = Math.max(...values) ; break} // max
  case 5: { value = +(values[0] > values[1]) ; break} // gt
  case 6: { value = +(values[0] < values[1]) ; break} // lt
  case 7: { value = +(values[0] == values[1]) ; break} // =
}
return { start, value }
}
}
parse(0)

// Cleaned up
class BitParser {
  #versionSum = 0
  #cursor = 0
  #bits

  constructor (bits) {
    this.#bits = bits
  }

  #nextBits (count) {
    const start = this.#cursor
    this.#cursor += count
    if (this.#cursor > this.#bits.length) {
      throw new RangeError('Cursor out of bounds.')
    }
    return +`0b${this.#bits.slice(start, this.#cursor)}`
  }

  #evalNextPacket () {
    const version = this.#nextBits(3)
    this.#versionSum += version
    const type = this.#nextBits(3)
    if (type === 4) {
      let value = 0
      while (true) {
        const lastBit = !this.#nextBits(1)
        // LOL bitwise operators being 32-bit threw me off. Sad!
        value *= 0b10000
        value += this.#nextBits(4)
        if (lastBit) {
          break
        }
      }
      return value
    } else {
      const values = []
      const lengthMode = this.#nextBits(1)
      if (lengthMode === 0) {
        const length = this.#nextBits(15)
        const end = this.#cursor + length
        while (this.#cursor < end) {
          values.push(this.#evalNextPacket())
        }
      } else {
        const packetCount = this.#nextBits(11)
        while (values.length < packetCount) {
          values.push(this.#evalNextPacket())
        }
      }
      switch (type) {
        case 0: { // sum
          return values.reduce((a, b) => a + b, 0)
        }
        case 1: { // product
          return values.reduce((a, b) => a * b, 1)
        }
        case 2: { // minimum
          return Math.min(...values)
        }
        case 3: { // maximum
          return Math.max(...values)
        }
        case 5: { // greater than
          return +(values[0] > values[1])
        }
        case 6: { // less than
          return +(values[0] < values[1])
        }
        case 7: { // equal
          return +(values[0] === values[1])
        }
        default: {
          throw new Error(`Unexpected packet type ${type}`)
        }
      }
    }
  }

  evaluate () {
    return {
      value: this.#evalNextPacket(),
      versionSum: this.#versionSum
    }
  }
}

const bits = document.body.textContent
  .trim()
  .split('')
  .map(char => parseInt(char, 16).toString(2).padStart(4, '0'))
  .join('')
new BitParser(bits).evaluate()
