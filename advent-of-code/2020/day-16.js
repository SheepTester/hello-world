// nested for loops didn't grow out of control at least!
;
[fields, yor, nearby] =document.body.textContent.trim()
.split(/\r?\n\r?\n/)
nearby=nearby.split(/\r?\n/).slice(1).map(a => a.split(',').map(Number))
fields = fields.split(/\r?\n/).map(a => {
;[name, range]=a.split(': ')
;[x, y] = range.split(' or ').map(v => v.split('-').map(Number))
return [  x, y]
})
invalid = 0
for (const near of nearby) {
something:
  for (const val of near) {
    for (const field of fields) {
      for (const [low, high] of field) {
        if (val >= low && val <= high) {
          continue something
        }
      }
    }
  invalid += val
  }
}
invalid

// *sigh* they really didn't need to have to require you to check EVERY field smsdfghhkdfkbdsfergh
;
[fields, yor, nearby] =
document.body.textContent.trim()
// `class: 0-1 or 4-19
// row: 0-5 or 8-19
// seat: 0-13 or 16-19

// your ticket:
// 11,12,13

// nearby tickets:
// 3,9,18
// 15,1,5
// 5,14,9`
.split(/\r?\n\r?\n/)
nearby=nearby.split(/\r?\n/).slice(1).map(a => a.split(',').map(Number))
fields = fields.split(/\r?\n/).map(a => {
;[name, range]=a.split(': ')
;[x, y] = range.split(' or ').map(v => v.split('-').map(Number))
return { ranges: [  x, y], name }
})
valid =nearby.filter(near => {
something:
  for (const val of near) {
    for (const { ranges } of fields) {
      for (const [low, high] of ranges) {
        if (val >= low && val <= high) {
          continue something
        }
      }
    }
    return false
  }
return true
})
yor=yor.split(/\r?\n/)[1].split(',').map(Number)
toCheck = [...valid, yor]
prod = 1n
prior = []
used = []
trialz = []
for (const { name, ranges } of fields) {
//if (!name.startsWith('departure ')) continue
const worked = []
for (var i = yor.length;i--;) {
//if (used[i]) continue
let s = false
main:
for (const tc of toCheck) {
for (const [low, high] of ranges ) {
if (tc[i] >= low && tc[i] <= high) {
//console.log(i, tc[i], 'violated', name, 'range', low, high)
continue main
}
}
s = true
break
//console.log(tc, 'pass')
}
if (s) continue
//break
worked.push([i, yor[i]])
}
trialz.push({ worked, name })
//console.log(yor[i])
//prod *= yor[i]
used[i] = true
}
trialz.sort((a, b) => a.worked.length - b.worked.length)
used = []
for (const { worked, name } of trialz) {
const [index, value] = worked.find((a) => !used[a[0]])
used[index] = true
if (name.startsWith('departure ')) prod *= BigInt(value)
}
prod
