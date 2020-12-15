// slow
accumulator = 0
pos = 0
ran = []
commands = document.body.textContent.trim().split(/\r?\n/).map(line => {
const [, command, argument] = line.match(/(acc|jmp|nop) ([+-]\d+)/)
return { command, argument: +argument }
})
while (!ran[pos]) {
ran[pos] = true
const { command, argument } = commands[pos]
switch (command) {
  case 'acc':
accumulator += argument
pos++
break
  case 'jmp':
pos += argument
break
  case 'nop':
pos++
break
}
}
accumulator

// brute force :sunglasses:
commands = document.body.textContent.trim().split(/\r?\n/).map(line => {
const [, command, argument] = line.match(/(acc|jmp|nop) ([+-]\d+)/)
return { command, argument: +argument }
})
function run (swapPos) {
accumulator = 0
pos = 0
ran = []
while (!ran[pos] && pos < commands.length) {
ran[pos] = true
const { command, argument } = commands[pos]
switch (command) {
  case 'acc':
accumulator += argument
pos++
break
  case 'jmp':
if (swapPos === pos) pos++
else pos += argument
break
  case 'nop':
if (swapPos === pos) pos += argument
else pos++
break
}
}
if (pos >= commands.length) {
console.log('something', accumulator)
}
}
for (let i = 0; i < commands.length; i++) run(i)
