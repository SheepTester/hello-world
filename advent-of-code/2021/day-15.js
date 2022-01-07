// Part 1...

// Takes forever
;grid = document.body.textContent
.trim().split(/(?:\r?\n){1}/) // owo v4
.map(line => {
return line.split('').map(Number)
})
risk = (r, c) => {
const opt1 = r >= grid.length - 1 ? Infinity : risk(r + 1, c)
const opt2 = c >= grid[0].length - 1 ? Infinity : risk(r, c + 1)
const min = Math.min(opt1, opt2)
return grid[r][c] + (min === Infinity ? 0 : min)
}
risk(0, 0)

// Gives a wrong answer
;grid = document.body.textContent
.trim().split(/(?:\r?\n){1}/) // owo v4
.map(line => {
return line.split('').map(Number)
})
consider = (r, c) => {
const opt1 = r >= grid.length - 1 ? Infinity : grid[r + 1][c]
const opt2 = c >= grid[0].length - 1 ? Infinity : grid[r][c + 1]
if (opt1 < opt2) return [r + 1, c, opt1]
else if (opt1 > opt2) return [r, c + 1, opt2]
else {
if (opt1 == Infinity) throw 3
const [x1, y1, r1] = consider(r + 1, c)
const [x2, y2, r2] = consider(r, c + 1)
return r1 < r2 ? 
  [x1, y1, r1]
  : [x2, y2, r2]
}
}
risk = 0
r = 0, c= 0
while (true) {
;[r, c, riskk] = consider(r, c)
risk += riskk
if (r === grid.length - 1 && c === grid[0].length - 1) break
}
risk

// Returns infinity
;grid = `1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`//document.body.textContent
.trim().split(/(?:\r?\n){1}/) // owo v4
.map(line => {
return line.split('').map(Number)
})
traverse = (r, c, risk, traversed) => {
//if (traversed.includes(`${r},${c}`)) return todo
//trav = (or, oc) => traverse(r + or, c + oc, risk + )
check = (r, c) => [r, c, traversed.includes(`${r},${c}`) ? Infinity : grid[r]?.[c] ?? Infinity]
const risks = [check(r - 1, c),
check(r + 1, c),
check(r, c - 1),
check(r, c + 1),]
const minRisk = Math.min(...risks.map(r => r[2]))
//console.log(r, c)
if (minRisk === Infinity) { return r === grid.length - 1 && c === grid[0].length - 1 ? risk : Infinity}
const minRiskies = risks.filter(r => r[2] === minRisk)
return Math.min(...minRiskies.map(r => traverse(r[0], r[1], risk + r[2], [...traversed, `${r[0]},${r[1]}`])))
/*if (minRiskies.length === 1) {
  return traverse(minRiskies[0][0], minRiskies[0][1], risk + minRiskies[0][2], [...traversed, `${minRiskies[0][0]},${minRiskies[0][1]}`])
} else {
  return Math.min()
}*/
}
traverse(0, 0, grid[0][0], ['0,0'])

// Dijkstra's algorithm attempt 1, keeps crawling into dead ends
;grid = document.body.textContent
.trim().split(/(?:\r?\n){1}/) // owo v4
.map(line => {
return line.split('').map(Number)
})
visited = {}
distToStart = {'0,0':0} // excludes
r = 0, c = 0, risk = 0
while (r < grid.length || c < grid[0].length) {
const rr = grid[r][c]
const dist = distToStart[`${r},${c}`] + rr
visited[`${r},${c}`] = true
risk += rr
mark = (r, c) => {
if (grid[r]?.[c] === undefined) return [r, c, Infinity]
distToStart[`${r},${c}`] ??= Infinity
return [r,c,distToStart[`${r},${c}`] = Math.min(distToStart[`${r},${c}`], dist)]
}
const dists = [mark(r - 1, c),
mark(r + 1, c),
mark(r, c - 1),
mark(r, c + 1)]
dists.sort((a, b) => a[2] - b[2])
const v = dists.find(([r, c]) => !visited[`${r},${c}`])
if (v[0] < 0 || v[1] < 0) throw dists
;[r, c] = v
}
risk

// Dijkstra's algorithm attempt 2 (cleaner), never ends
const riskGrid = document.body.textContent
  .trim()
  .split(/\r?\n/)
  .map(row => {
    return row.split('').map(risk => +risk)
  })
const inGrid = (row, column) =>
  row >= 0 &&
  column >= 0 &&
  row < riskGrid.length &&
  column < riskGrid[0].length

const visited = []
const distances = { '0,0': 0 } // A tentative Infinity by default

const destination = { row: riskGrid.length - 1, column: riskGrid[0].length - 1 }
let current = { row: 0, column: 0 }
while (true) {
  if (visited.includes(`${current.row},${current.column}`)) {
    throw new Error('This position has already been visited.')
  }

  const distance = distances[`${current.row},${current.column}`]

  const neighbours = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ]
  for (const [offsetRow, offsetColumn] of neighbours) {
    const neighbourRow = current.row + offsetRow
    const neighbourColumn = current.column + offsetColumn
    if (
      inGrid(neighbourRow, neighbourColumn) &&
      !visited.includes(`${neighbourRow},${neighbourColumn}`)
    ) {
      const calculatedDistance =
        distance + riskGrid[neighbourRow][neighbourColumn]
      distances[`${neighbourRow},${neighbourColumn}`] = Math.min(
        calculatedDistance,
        distances[`${neighbourRow},${neighbourColumn}`] ?? Infinity
      )
    }
  }

  visited.push(`${current.row},${current.column}`)
  if (
    current.row === destination.row &&
    current.column === destination.column
  ) {
    break
  }

  const [row, column] = Object.keys(distances)
    .reduce(
      (accumulated, current) =>
        (accumulated === null || distances[current] < distances[accumulated]) &&
        !visited.includes(current)
          ? current
          : accumulated,
      null
    )
    .split(',')
    .map(Number)

  current = { row, column }
}

distances[`${destination.row},${destination.column}`]
