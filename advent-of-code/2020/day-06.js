// worked swell
document.body.textContent.split(/\r?\n\r?\n/).filter(a => a).map(g => {
const l = new Set()
for (const ll of g) {
if (/^[a-z]$/.test(ll)) l.add(ll)
}
return l.size
}).reduce((a, b) => a + b)

// part 2 attempt 1
document.body.textContent.split(/\r?\n\r?\n/).filter(a => a).map(g => {
const [ok, ...hmm] = g.split(/\r?\n/)
const test = new Set([...ok.replace(/[^a-z]/g, '')])
for (const ll of hmm) {
for (const letter of [...test]) {
if (!ll.includes(letter)) test.delete(letter)
}
}
return test.size
}).reduce((a, b) => a + b)

// ANNOYING there was an empty line at the very end of the input >:(((
document.body.textContent.split(/\r?\n\r?\n/).filter(a => a).map(group => {
const [first, ...others] = group.split(/\r?\n/).filter(a => a)
const questions = new Set([...first])
for (const person of others) {
  for (const question of questions) {
    if (!person.includes(question)) {
      questions.delete(question)
    }
  }
}
return questions.size
}).reduce((a, b) => a + b)
