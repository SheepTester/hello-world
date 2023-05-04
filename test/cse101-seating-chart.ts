// Student,Row,Seat
// deno run --allow-read test/cse101-seating-chart.ts ignored/CSE_101_Midterm_1_Seating_Arrangement_-_The_Jeannie.csv jeannie > ignored/cse101-mt-jeannie.csv
// deno run --allow-read test/cse101-seating-chart.ts ignored/CSE_101_Midterm_1_Seating_Chart_-_MOS_113.csv > ignored/cse101-mt-mos113.csv

// https://facilities.ucsd.edu/Database/CAP/1001812/113145/Jeannie_Auditorium%20_GA0205.pdf
// https://facilities.ucsd.edu/Database/CAP/1001811/113139/NTPLLN_Mosaic_0113.pdf

if (Deno.args.length === 0) {
  console.error(
    'deno run --allow-read test/cse101-seating-chart.ts <input> (jeannie) > output'
  )
  Deno.exit()
}

const jeannie = Deno.args[1] === 'jeannie'
/** Maps a Jeannie seat number to one that can be sorted numerically */
function jeannieSeat (seat: number): number {
  if (seat >= 100) {
    // Middle section, 101-111 to 101-124
    return seat
  } else if (seat % 2 === 1) {
    // Right section professor's view, 1-15 odd
    return seat + 200
  } else {
    // Left section professor's view, 16-2 even
    return -seat
  }
}

const lines = await Deno.readTextFile(Deno.args[0]).then(file =>
  file
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map(line => line.split(','))
)

const seats = new Set<number>()
const seating: Record<string, Record<number, string>> = {}
for (const [student, row, seat] of lines) {
  seating[row] ??= {}
  seating[row][+seat] = student
  seats.add(+seat)
}

const seatOrder = [...seats].sort(
  jeannie ? (a, b) => jeannieSeat(a) - jeannieSeat(b) : (a, b) => a - b
)

console.log('Row,' + seatOrder.join(','))
for (const row of Object.keys(seating).sort()) {
  console.log(
    row + ',' + seatOrder.map(seat => seating[row][seat] ?? '').join(',')
  )
}
