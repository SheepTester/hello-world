// match is more concise than matchAll in this case /shrug
valid = 0
;[document.body.textContent.split(/\r?\n/).filter(a => a).map(line => {
const [, min, max, letter, pass] = line.match(/(\d+)-(\d+) (\w): (\w+)/)
const test = new RegExp(letter, 'g')
const times = pass.match(test)?.length || 0
const isValid = times >= min && times <= max
if (isValid) valid++
return { times, min, max, isValid }
}),
valid]

// !== suffices for xor
valid = 0
;[document.body.textContent.split(/\r?\n/).filter(a => a).map(line => {
const [, a, b, letter, pass] = line.match(/(\d+)-(\d+) (\w): (\w+)/)
const isValid = (pass[+a - 1] === letter) !== (pass[+b - 1] === letter)
if (isValid) valid++
return { line, pass, a, b, isValid }
}),
valid]
