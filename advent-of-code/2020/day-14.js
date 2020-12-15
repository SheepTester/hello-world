// sometimes weak typing is sad
mem = []
document.body.textContent.trim()
.split(/\r?\n/)
.forEach(line => {
const [, maskCmd, arg1, arg2] = line.match(/mask = ([01X]+)|mem\[(\d+)\] = (\d+)/)
if (maskCmd) {
mask = val => {
const bin = val.toString(2).padStart('111X01X0100X111X1X010XX01X1111101100'.length, 0)
console.log([...maskCmd].map((d, i) => d === 'X' ? bin[i] : d))
return BigInt('0b' + [...maskCmd].map((d, i) => d === 'X' ? bin[i] : d).join(''))
}
} else {
mem[arg1] = mask(+arg2)
}
})
tot = 0n
mem.forEach(v => tot += v)
tot

// sad; that moment when strong typing is also sad
mem = new Map()
document.body.textContent.trim()
.split(/\r?\n/)
.forEach(line => {
const [, maskCmd, arg1, arg2] = line.match(/mask = ([01X]+)|mem\[(\d+)\] = (\d+)/)
if (maskCmd) {
mask = (dest, val) => {
const bin = dest.toString(2).padStart('111X01X0100X111X1X010XX01X1111101100'.length, 0)
const xLocs = []
const memDest = [...maskCmd].map((d, i) => d === 'X' ? (xLocs.push(i), 'X') : d === '1' ? 1:bin[i]).join('')
//console.log(bin, memDest)
for (let i = 0; i < 2 ** xLocs.length; i++) {
const binX = i.toString(2).padStart(xLocs.length, '0')
let p = 0
let v = BigInt('0b' + memDest.replace(/X/g, () => {

return binX[p++]
})).toString()
p = 0
// console.log(i, memDest.replace(/X/g, () => {

// return binX[p++]
// }), v)
mem.set(v, val)
}

}
} else {
mask(+arg1, BigInt(arg2))
}
})
tot = 0n
for (const v of mem.values()) tot += v
tot
