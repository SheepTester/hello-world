;scanners = document.body.textContent
.trim().split(/(?:\r?\n){2}/) // owo v4
.map(scanner => {
;[name, ...coords]=scanner.split(/\r?\n/)
;[,name] = name.match(/--- scanner (\d+) ---/).map(Number)
coords = coords.map(coord => coord.split(',').map(Number))
diffs = [[],[],[]]
for (let i = 0; i < coords.length; i++)
for (let j = i + 1; j < coords.length; j++) {
for (let k = 0; k < 3; k++) {
diffs[k].push(coords[i][k] - coords[j][k])
}
}
return { name, coords, diffs }
})

intersect = (arr1, arr2) => {
const deleted = Symbol()
const arr2Clone = [...arr2]
return arr1.filter(item => {
const index = arr2Clone.indexOf(item)
if (index !== -1) {
arr2Clone[index] = deleted
return true
}
})
}
//intersect([1, 1, 1, 2, 3], [1, 1, 2, 2, 4])
minus = arr => arr.map(a => -a)
wow = {}
for (let j = 0; j < 3; j++) 
for (const negative of [false, true])
  for (let i = 0; i < 3; i++) {
aa = scanners[1].diffs[i]
wow[`${j} <-> ${negative ? '-' : '+'}${i}`] = intersect(scanners[0].diffs[j], negative ? minus(aa) : aa
                                               )}
wow
