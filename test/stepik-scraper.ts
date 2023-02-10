// STEPIK_SESSIONID= deno run --allow-net=stepik.org --allow-env=STEPIK_SESSIONID test/stepik-scraper.ts 579 > ignored/cse100.html

const ROOT = 'https://stepik.org'

const [courseId] = Deno.args
const cookie = `sessionid=${Deno.env.get('STEPIK_SESSIONID')}`

type StepikShoebox = {
  courses: {
    id: number
    summary: string
    instructors: number[]
    certificate: string
    requirements: string
    description: string // HTML
    sections: number[]
    title: string
    slug: string
  }[]
  'course-review-summaries': unknown[]
  stepics: unknown[]
  users: unknown[]
  profiles: unknown[]
}
type Section = {
  id: number
  course: number
  units: number[]
  position: number
  title: string
  slug: string
}
type Unit = {
  id: number
  section: number
  lesson: number
  position: number
}
type Lesson = {
  id: number
  steps: number[]
  title: string
  slug: string
}
type Step = {
  id: number
  lesson: number
  position: number
  block: {
    name: string // either 'text' or the type of answer for the problem
    text: string
  }
}

console.log(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />`)

const initData: StepikShoebox = await fetch(
  `${ROOT}/course/${courseId}/syllabus`,
  { headers: { cookie } }
)
  .then(r => r.text())
  .then(html => html.match(/__stepik_shoebox__ = JSON\.parse\('(.+)'\)/)?.[1])
  .then(json => JSON.parse(JSON.parse(`"${json}"`)))
const [course] = initData.courses

console.log(`<title>${course.summary}</title>`)
console.log('</head><body>')
console.log(`<h1 id="${course.summary}">${course.title}</h1>`)

async function getApi<T> (path: string, ids: number[]): Promise<T[]> {
  return fetch(
    `${ROOT}/api/${path}?${new URLSearchParams(
      ids.map(id => ['ids[]', String(id)])
    )}`,
    { headers: { cookie } }
  )
    .then(r =>
      r.ok ? r.json() : Promise.reject(new Error(`${r.status} HTTP error`))
    )
    .then(json => json[path])
}
const sections = await getApi<Section>('sections', course.sections)
const units = await getApi<Unit>(
  'units',
  sections.flatMap(section => section.units)
)
const lessons = await getApi<Lesson>(
  'lessons',
  units.map(unit => unit.lesson)
)
for (const lesson of lessons) {
  const steps = await getApi<Step>('steps', lesson.steps)
  for (const step of steps) {
    if (step.block.name === 'text') {
      console.log(step.block)
    }
  }
}
