// logic is hard >:((
;
food =// document.body.textContent
`mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)`
.trim().split(/\r?\n/)
.map(line => {
if (!line.includes('(')) throw line
;const [left, right ] =line.split(' (')
return {
ingred: left.split(' '),
allerg: right.replace(/^contains /, '').replace(/\)$/, '').split(', ')
}
})
ingreds = new Set()
perhaps = new Map() // alelrgen -> ingreds that've been listed every time the allergen's been listed
imposs = new Map()
hadShown = new Map() // ALL ingreds that showed up in all list (so if ingred isn't here...)
for (const { ingred, allerg } of food) {
ingreds.add(...ingred)
for (const all of allerg) {
    if (!hadShown.has(all)) hadShown.set(all, new Set())
  hadShown.get(all).add(...ingred)
if (!perhaps.has(all)) perhaps.set(all, ingred)
else {
  oldP = perhaps.get(all)
    if (!imposs.has(all)) imposs.set(all, new Set())
  for (const m of oldP) if (!ingred.includes(m)) {
    // ingredient(m) cannot possibly be this allergen
    imposs.get(all).add(m)
  }
  for (const ing of ingred) {
if (!oldP.includes(ing)) {
    // ingred had no chance, cannot poss
    imposs.get(all).add(ing)
  }
  }
  perhaps.set(all, oldP.filter(i => ingred.includes(i)))
}
}
}
;[[, first], ...rest] = imposs
impossAll = [...first].filter(ingred => rest.every(([allgName, allergenCant]) => !hadShown.get(allgName).has(ingred) || allergenCant.has(ingred)))

// attempt 2, part 1
;
food = document.body.textContent
// `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
// trh fvjkl sbzzf mxmxvkd (contains dairy)
// sqjhc fvjkl (contains soy)
// sqjhc mxmxvkd sbzzf (contains fish)`
.trim().split(/\r?\n/)
.map(line => {
if (!line.includes('(')) throw line
;const [left, right ] =line.split(' (')
return {
ingred: left.split(' '),
allerg: right.replace(/^contains /, '').replace(/\)$/, '').split(', ')
}
})
// Can't possibly:
/**
1. If the allergen showed up multiple times, and the ingredient has shown up every time, it COULD be the allergen.
2. If the allergen showed up once, and the ingredient showed up, it COULD be the allergen (a colloary).
*/
allIngreds = new Set()
attendance = new Map() // allergen -> ingreds who show up every time
for (const { ingred, allerg } of food) {
for (const m of ingred)allIngreds.add(m)
for (const alg of allerg ) {
if (attendance.has(alg)) {
hadBeenHere = attendance.get(alg)
// eliminate those who didn't show up this time
attendance.set(alg, hadBeenHere.filter(ing => ingred.includes(ing)))
} else {
attendance.set(alg, ingred) // All present!
}
}
}
defCant = [...allIngreds].filter(ing => {
// Ingredient can't be registered as a regular attendant of any allergen
for (const [, ingreds] of attendance) {
if (ingreds.includes(ing)) return false
}
return true
})
times = 0
for (const { ingred } of food) {
for (const ing of ingred) if (defCant.includes(ing)) times++
}
times

// alphabetized the wrong thing oops
;
food = document.body.textContent
// `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
// trh fvjkl sbzzf mxmxvkd (contains dairy)
// sqjhc fvjkl (contains soy)
// sqjhc mxmxvkd sbzzf (contains fish)`
.trim().split(/\r?\n/)
.map(line => {
if (!line.includes('(')) throw line
;const [left, right ] =line.split(' (')
return {
ingred: left.split(' '),
allerg: right.replace(/^contains /, '').replace(/\)$/, '').split(', ')
}
})
// Can't possibly:
/**
1. If the allergen showed up multiple times, and the ingredient has shown up every time, it COULD be the allergen.
2. If the allergen showed up once, and the ingredient showed up, it COULD be the allergen (a colloary).
*/
allIngreds = new Set()
attendance = new Map() // allergen -> ingreds who show up every time
for (const { ingred, allerg } of food) {
for (const m of ingred)allIngreds.add(m)
for (const alg of allerg ) {
if (attendance.has(alg)) {
hadBeenHere = attendance.get(alg)
// eliminate those who didn't show up this time
attendance.set(alg, hadBeenHere.filter(ing => ingred.includes(ing)))
} else {
attendance.set(alg, ingred) // All present!
}
}
}
defCant = [...allIngreds].filter(ing => {
// Ingredient can't be registered as a regular attendant of any allergen
for (const [, ingreds] of attendance) {
if (ingreds.includes(ing)) return false
}
return true
})
times = 0
for (const obj of food) {
obj.inert = obj.ingred.filter(m => !defCant.includes(m))
}
taken = []
vv = [...attendance].sort((a, b) => a[1].length - b[1].length)
map = new Map()
function next () {
let min = Infinity, name = ''
for (const [n, m] of attendance.entries()) {
const mm = m.filter(m => !taken.includes(m))
if (mm.length < min) {min = mm.length, name = n}
}
let valid
if (name){valid = attendance.get(name).filter(m => !taken.includes(m))
 attendance.delete(name)}
return [name, valid]
}
while ((ok = next()), ok[1]) {
const [name, valid ] = ok
console.log(name, valid)
take = valid[0]
taken.push(take)
map.set(name, take)
}
[...map.keys()].sort().map(a => map.get(a)).join(',')
/*for (const [allName, suspectIngred] of vv) {
takable = suspectIngred.filter(m => !taken.includes(m))
//console.log(takable, suspectIngred)
map.set(allName, takable[0])
taken.push(takable[0])
}
map*/
