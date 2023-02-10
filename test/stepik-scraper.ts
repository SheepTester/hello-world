// STEPIK_SESSIONID= deno run --allow-net=stepik.org --allow-env=STEPIK_SESSIONID test/stepik-scraper.ts 579 > ignored/cse100.html

const ROOT = 'https://stepik.org'

const [courseId] = Deno.args
const cookie = `sessionid=${Deno.env.get('STEPIK_SESSIONID')}`

function partition<T> (
  array: T[],
  getKey: (value: T) => string | number
): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of array) {
    const key = getKey(item)
    result[key] ??= []
    result[key].push(item)
  }
  return result
}

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

const initData: StepikShoebox = await fetch(
  `${ROOT}/course/${courseId}/syllabus`,
  { headers: { cookie } }
)
  .then(r => r.text())
  .then(html => html.match(/__stepik_shoebox__ = JSON\.parse\('(.+)'\)/)?.[1])
  .then(json => JSON.parse(JSON.parse(`"${json}"`)))
const [course] = initData.courses

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
// sections.sort((a, b) => a.position - b.position)
// const sectionIdMap = Object.fromEntries(
//   sections.map(section => [section.id, section])
// )
const units = await getApi<Unit>(
  'units',
  sections.flatMap(section => section.units)
)
// units.sort((a, b) =>
//   a.section === b.section
//     ? a.position - b.position
//     : sectionIdMap[a.section].position - sectionIdMap[b.section].position
// )
const unitIdMap = Object.fromEntries(units.map(unit => [unit.id, unit]))
/** NOT in order! Do not iterate over this. */
const lessons = await getApi<Lesson>(
  'lessons',
  units.map(unit => unit.lesson)
)
const lessonIdMap = Object.fromEntries(
  lessons.map(lesson => [lesson.id, lesson])
)
const firstLessonMap = Object.fromEntries(
  sections.map(section => [unitIdMap[section.units[0]].lesson, section])
)
console.log(units.map(unit => lessonIdMap[unit.lesson].title))
Deno.exit()

console.log('<!DOCTYPE html><html lang="en"><head>')
console.log(
  '<meta name="viewport" content="width=device-width, initial-scale=1" />'
)
console.log(`<title>${course.summary}</title>`)
console.log('</head><body>')
console.log(`<h1 id="${course.slug}">${course.title}</h1>`)
console.log('<ol>')
for (const section of sections) {
  console.log('<li>')
  console.log(`<a href="#${section.slug}">${section.title}</a>`)
  console.log('<ol>')
  for (const unit of section.units) {
    const lesson = lessonIdMap[unitIdMap[unit].lesson]
    console.log('<li>')
    console.log(`<a href="#${lesson.slug}">${lesson.title}</a>`)
    console.log('</li>')
  }
  console.log('</ol>')
  console.log('</li>')
}
console.log('</ol>')

for (const lesson of lessons) {
  const section = firstLessonMap[lesson.id]
  if (section) {
    console.log(`<h2 id="${section.slug}">${section.title}</h2>`)
  }
  console.log(`<h3 id="${lesson.slug}">${lesson.title}</h3>`)

  const steps = await getApi<Step>('steps', lesson.steps)
  steps.sort((a, b) => a.position - b.position)
  let first = true
  for (const step of steps) {
    if (step.block.name === 'text') {
      if (first) {
        first = false
      } else {
        console.log('<hr />')
      }
      console.log(step.block.text)
    }
  }
}

console.log('</body></html>')
