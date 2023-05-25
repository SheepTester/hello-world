const width = 49
const height = 20
const gateCount = 4
const windowCount = 10

const towerEnd = height - 2

const canvas = Array.from({ length: height }, () =>
  Array.from<string>({ length: width }).fill(' ')
)
function writeShape (shape: string, x: number, y: number): void {
  let row = 0
  let col = 0
  for (const char of shape) {
    if (char === '\n') {
      row++
      col = 0
    } else {
      canvas[y + row][x + col] = char
      col++
    }
  }
}
function repeat (line: string, length: number): string {
  return line.repeat(Math.ceil(length / line.length)).slice(0, length)
}
function distribute (
  objWidth: number,
  count: number,
  startX: number,
  availWidth: number
): number[] {
  const xPos: number[] = []
  let unoccupiedWidth = availWidth - objWidth * count
  let x = startX
  for (let i = 0; i < count; i++) {
    const offset = Math.floor(Math.random() * unoccupiedWidth)
    unoccupiedWidth -= offset
    xPos.push(x + offset)
    x += offset + objWidth
  }
  return xPos
}

const elements = {
  tower:
    String.raw` /\
/__` + '\\',
  window: String.raw` _
[_]`,
  bridge: String.raw` /|\
/ | \ `,
  gate: String.raw` _
/ \
| |`,
  battlement: String.raw` _   _   _
  | |_| |_| |
  |_       _|`
}

writeShape(elements.tower, 0, 0)
writeShape(elements.tower, width - 4, 0)
for (let row = 2; row < towerEnd; row++) {
  writeShape('|  |', 0, row)
  writeShape('|  |', width - 4, row)
}

const windowsPerRow = Math.floor((width - 11) / 3)
const minRows = Math.ceil(windowCount / windowsPerRow)
const lowestBattlement = towerEnd - 5 - minRows * 2
const battlementRow = Math.floor(Math.random() * lowestBattlement)
writeShape(repeat('  _ ', width - 8), 4, battlementRow)
writeShape(repeat('_| |', width - 8), 4, battlementRow + 1)

const availWindowPositions: [number, number][] = []
for (let x = 4; x < width - 7; x += 3) {
  for (let y = battlementRow + 2; y < towerEnd - 4; y += 2) {
    availWindowPositions.push([x, y])
    // writeShape(elements.window, x, y)
  }
}
for (let i = 0; i < windowCount; i++) {
  const index = Math.floor(Math.random() * availWindowPositions.length)
  const [[x, y]] = availWindowPositions.splice(index, 1)
  writeShape(elements.window, x, y)
}

const gates = distribute(5, gateCount, 4, width - 8)
for (const x of gates) {
  writeShape(elements.gate, x + 1, towerEnd - 3)
  writeShape(elements.bridge, x, towerEnd)
}

console.log(canvas.map(line => line.join('')).join('\n'))
