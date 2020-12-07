// UHHHH
containedBy = {}
document.body.textContent.trim().split(/\r?\n/).forEach(rule => {
const match = rule.match(/^(\w+ \w+) bags contain (.+)\.$/)
if (!match) console.error(rule)
const [, bagType, containments] = match
if (containments === 'no other bags') return
for (const containment of containments.split(', ')) {
const match = containment.match(/^(\d+) (\w+ \w+) bags?$/)
if (!match) console.error(containment)
const [, count, containType] = match
if (!containedBy[containType]) containedBy[containType] = new Set()
containedBy[containType].add(bagType)
}
})
canContain = new Set()
function recurse (containers) {
for (const parent of containers) {
if (canContain.has(parent)) continue
canContain.add(parent)
if (containedBy[parent]) //console.error('no', parent)
recurse(containedBy[parent])
// no posh silver
}
}
recurse(containedBy['shiny gold'])
canContain.size

// this is a very yikes and yet fun problem. glad there were no infinite recursions!
bagContains = {}
document.body.textContent.trim().split(/\r?\n/).forEach(rule => {
const match = rule.match(/^(\w+ \w+) bags contain (.+)\.$/)
if (!match) console.error(rule)
const [, bagType, containments] = match
bagContains[bagType] = []
if (containments === 'no other bags') return
for (const containment of containments.split(', ')) {
const match = containment.match(/^(\d+) (\w+ \w+) bags?$/)
if (!match) console.error(containment)
const [, count, containType] = match
bagContains[bagType].push({ count: +count, containType })
}
})
function howManyBags (bagName) {
const contains = bagContains[bagName]
let innerBags = 0
for (const { count, containType } of contains) {
innerBags += count * (1 + howManyBags(containType))
}
return innerBags
}
howManyBags('shiny gold')
