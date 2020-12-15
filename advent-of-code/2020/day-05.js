// it's binary!
Math.max(...document.body.textContent.split(/\r?\n/).filter(a => a).map(row => parseInt(row.replace(/[BR]/g, '1').replace(/[FL]/g, '0'), 2)))

// sanity check for part 1:
`BFFFBBFRRR
FFFBBBFRRR
BBFFBBFRLL`.split(/\r?\n/).filter(a => a).map(row => parseInt(row.replace(/[BR]/g, '1').replace(/[FL]/g, '0'), 2))

// manually searching through the output required, but the oddball should be pretty obvious
ids = document.body.textContent.split(/\r?\n/).filter(a => a).map(row => parseInt(row.replace(/[BR]/g, '1').replace(/[FL]/g, '0'), 2))
for (let i = 0b1000; i < 0b10000000000 - 0b1000; i++) if (!ids.includes(i)) console.log(i)
