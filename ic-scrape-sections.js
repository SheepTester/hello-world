async function getSection (id) {
  const res = await fetch(
    `/campus/resources/portal/section/${id}?_expand=course-school&_expand=terms&_expand=periods-periodSchedule&_expand=teacherPreference&_expand=room&_expand=teachers`,
    {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache'
      }
    }
  )
  if (!res.ok) throw new Error(`${res.status} http error`)
  const {
    calendarName,
    courseAttendance,
    courseName,
    courseNumber,
    endYear,
    isActive,
    isAdultCount,
    isHomeroomSection,
    isLunchCount,
    isMilkCount,
    number,
    teacherDisplay,

    course: {
      courseOnlyCurriculum,
      description,
      gpaWeight,
      honorsCode,
      stateCode,
      transcript
    } = {},
    periods,
    teachers,
    terms
  } = await res.json()
  return {
    id,

    calendarName,
    courseAttendance,
    courseName,
    courseNumber,
    endYear,
    isActive,
    isAdultCount,
    isHomeroomSection,
    isLunchCount,
    isMilkCount,
    number,
    teacherDisplay,

    course: {
      courseOnlyCurriculum,
      description,
      gpaWeight,
      honorsCode,
      stateCode,
      transcript
    },
    periods: periods.map(({
      endTime,
      isNonInstructional,
      isStandardDay,
      lunchMinutes,
      name,
      passingMinutes,
      periodMinutes,
      periodSchedule: { name: periodScheduleName },
      startTime
    }) => ({
      endTime,
      isNonInstructional,
      isStandardDay,
      lunchMinutes,
      name,
      passingMinutes,
      periodMinutes,
      periodSchedule: { name: periodScheduleName },
      startTime
    })),
    teachers: teachers.map(({
      courseAdvisory,
      email,
      firstName,
      isPrimaryTeacher,
      lastName,
      middleName,
      sectionAdvisory,
      staffType,
      workPhone,
      workPhoneUri
    }) => ({
      courseAdvisory,
      email,
      firstName,
      isPrimaryTeacher,
      lastName,
      middleName,
      sectionAdvisory,
      staffType,
      workPhone,
      workPhoneUri
    })),
    terms: terms.map(({
      endDate,
      isPrimary,
      startDate,
      termName
    }) => ({
      endDate,
      isPrimary,
      startDate,
      termName
    }))
  }
}

async function forwardsFrom (start, output, maxAttempts = 1) {
  let errors = 0
  while (errors < maxAttempts) {
    try {
      output[start] = await getSection(start)
      errors = 0 // Reset error count if successful
    } catch (_) {
      errors++
    }
    start++
  }
  return start
}

async function backwardsBefore (start, output, maxAttempts = 1) {
  let errors = 0
  while (errors < maxAttempts) {
    start--
    try {
      output[start] = await getSection(start)
      errors = 0 // Reset error count if successful
    } catch (_) {
      errors++
    }
  }
  return start
}

async function main (maxAttempts = 1) {
  const sectionIds = await fetch(
    '/campus/resources/portal/roster?_enableScheduleForGrades=true', {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache'
    }
  })
    .then(r => r.json())
    .then(arr => arr.map(s => s.sectionID))
  const min = Math.min(...sectionIds)
  const max = Math.max(...sectionIds)
  const start = sectionIds[0] // Use a random one
  console.log('Range of your section IDs:', min, max)

  // I think 569 350 is the biggest?
  const output = {}
  window.output = output
  {
    const stop = await backwardsBefore(start, output, maxAttempts)
    console.log(
      'Min. section ID checked:',
      stop,
      stop < min ? '👍' : '😟 This is incomplete!'
    )
  }
  {
    const stop = await forwardsFrom(start, output, maxAttempts)
    console.log(
      'Max. section ID checked:',
      stop,
      stop > max ? '👍' : '😟 This is incomplete!'
    )
  }
  return output
}
