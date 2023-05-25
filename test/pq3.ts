type Shape = 'square' | 'star' | 'triangle' | 'circle'
type Rule = {
  readonly left: Shape
  readonly right: Shape
  readonly result: Shape
}

const rules: Rule[] = [
  { left: 'square', right: 'square', result: 'star' },
  { left: 'triangle', right: 'circle', result: 'square' },
  { left: 'star', right: 'triangle', result: 'circle' },
  { left: 'circle', right: 'square', result: 'triangle' }
]

function combine (sequence: Shape[], priorities: number[]): Shape[] {
  // Sort by corresponding priority
  const prioritizedRules = [...rules].sort(
    (a, b) => priorities[rules.indexOf(a)] - priorities[rules.indexOf(b)]
  )
  console.log(sequence)

  main: while (true) {
    for (const rule of prioritizedRules) {
      let found = false
      for (let i = 0; i < sequence.length - 1; i++) {
        if (
          (sequence[i] === rule.left && sequence[i + 1] === rule.right) ||
          (sequence[i + 1] === rule.left && sequence[i] === rule.right)
        ) {
          sequence.splice(i, 2, rule.result)
          console.log(sequence, rule)
          i--
          found = true
        }
      }
      if (found) {
        continue main
      }
    }
    break
  }
  return sequence
}

// console.log(combine(['star', 'triangle', 'circle', 'square'], [1, 2, 3, 4]))
console.log(
  combine(
    [
      'star',
      'triangle',
      'circle',
      'square',
      'star',
      'triangle',
      'circle',
      'square'
    ],
    [1, 2, 3, 4]
  )
)
