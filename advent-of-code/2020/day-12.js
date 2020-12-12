// ANNOY forgot to scale F by val >:((( and that L/R is given a rotation in degrees
e = 0, n = 0, dir = 0
dirs = {
0: [1, 0],
1: [0, 1],
2: [-1, 0],
3: [0, -1]
}
;
document.body.textContent.trim()
.split(/\r?\n/)
.forEach(instr => {
const val = +instr.slice(1)
switch (instr[0]) {
  case 'E':
e += val
break
  case 'W':
e -= val
break
  case 'N':
n += val
break
  case 'S':
n -= val
break
  case 'F': {
const [de, dn] = dirs[dir]
n += dn * val
e += de * val
break
  }
  case 'R': {
dir = (dir + 4 - val / 90) % 4
break
  }
  case 'L': {
dir = (dir + val / 90) % 4
break

  }default: console.error(instr)
}
})
Math.abs(n) + Math.abs(e)

// realized too late that the waypoint is an OFFSET
e = 0, n = 0
we = 10, wn = 1
;
document.body.textContent.trim()
.split(/\r?\n/)
.forEach(instr => {
let val = +instr.slice(1)
switch (instr[0]) {
  case 'E':
we += val
break
  case 'W':
we -= val
break
  case 'N':
wn += val
break
  case 'S':
wn -= val
break
  case 'F': {
e += (we ) * val
n += (wn ) * val
break
  }
  case 'R': {
while (true ){
if (val === 0) break
if (val < 0) throw val
;[we, wn] = [ + wn, - we]
val -= 90
}
console.log(we, wn, {e ,n })
break
  }
  case 'L': {
while (true ){
if (val === 0) break
if (val < 0) throw val
;[we, wn] = [- wn, + we]
val -= 90
}
console.log(we, wn)
break

  }default: console.error(instr)
}
console.log({e, n})
})
Math.abs(n) + Math.abs(e)
