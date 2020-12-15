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
