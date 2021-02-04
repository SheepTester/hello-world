// deno run --allow-net --allow-read=./ignored/ --allow-write=./ignored/ upar.ts

import { ensureDir } from 'https://deno.land/std@0.85.0/fs/ensure_dir.ts'

async function getPeople (rtm: string, name: string): Promise<any> {
  return fetch('https://login.donjohnston.net/upar/verifyAssignmentNameAndPassword?rtm=' + rtm, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assignmentName: name,
      assignmentPassword: 'student',
    }),
  })
    .then(r => r.json())
    .then(({ assignment: { assignment_id } }) =>
      fetch('https://login.donjohnston.net/upar/listAssessments?rtm=' + rtm, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: assignment_id,
        }),
      }))
    .then(r => r.json())
}

const protocols = [
  ['Gunn 9th Grade', '2024'],
  ['Gunn 10th Grade', '2023'],
  ['Gunn 11th Grade', '2022'],
  ['Gunn 12th Grade', '2021'],
]

const response = await fetch('https://startpar.com/')
const url = new URL(response.url)
const rtm = url.searchParams.get('rtm')
if (!rtm) {
  throw new Error('URL has no rtm')
}

await ensureDir('./ignored/')
for (const [protocol, grade] of protocols) {
  const json = await getPeople(rtm, protocol)
  const path = `./ignored/upar-${grade}.json`
  Deno.writeTextFile(path, JSON.stringify(json, null, '  '))
  console.log('=>', path)
}
