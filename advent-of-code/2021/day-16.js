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
