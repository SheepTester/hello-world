const elements = {
  tower: String.raw`    /\
   /__\
    ||`,
  window: String.raw` |   _   |
 |  [_]  |`,
  bridge: String.raw`    /|\
   / | \ `,
  gate: String.raw` |   _   |
 |  / \  |
 |  | |  |`,
  battlement: String.raw` _   _   _
| |_| |_| |
|_       _|`
}

console.log(elements.tower)
// for (; Math.random() < 0.8; ) {
//   console.log(elements.window)
// }
for (; Math.random() < 0.5; ) {
  console.log(elements.battlement)
  for (; Math.random() < 0.8; ) {
    console.log(elements.window)
  }
}
console.log(elements.gate)
console.log(elements.bridge)
