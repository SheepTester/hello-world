// manual analysis required
;[time, buses] =document.body.textContent.trim()
.split(/\r?\n/)
time = +time
buses = buses.split(',').filter(x => x !== 'x').map(Number)
buses.forEach(bus => {
console.log({ bus, m: Math.ceil((time / bus)) * bus - time })
})

// probably too naive
;[, buses] =document.body.textContent.trim()
.split(/\r?\n/)
buses = buses.split(',').map(v => v === 'x' ? 'x' : +v)
id = Math.max(...buses.filter(x => x !== 'x'))
index = buses.indexOf(id)
busIds = buses.map((v, i) => v === 'x' ? null : [v, i - index]).filter(a => a)
wow:
for (let i = id; i < 100000000000000; i += id) {
// i - timestamp
for (const [id, offset] of busIds) {
if ((i + offset) % id !== 0) continue wow
}
console.log(i)
break
}

// implementation of the Racket attempt but in more comfy language
;
[, input] = document.body.textContent
.trim().split(/\r?\n/)
busIds = input.split(',').map((v, i) => v !== 'x' ? [+v, i] : null).filter(v => v)
function takeABreak (time = 100) {
  return new Promise(resolve => setTimeout(resolve), time)
}
interval = busIds[0][0] 
timestamp = interval
for ( const [busId, offset] of busIds.slice(1)) {
for (; (timestamp + offset) % busId !== 0; timestamp += interval);
console.log(`Up to bus ${busId}, there is an ideal time at ${timestamp} uwu`)
await takeABreak()
interval *= busId // lcm of primes
}
console.log(timestamp) 
for ( const [busId, offset] of busIds) {
console.log(`(${timestamp} + ${offset}) / ${busId} = ${(timestamp + offset) / busId}`) 
}
