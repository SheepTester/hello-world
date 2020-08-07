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

async function forwardsFrom (start, output) {
  while (true) {
    try {
      output[start] = await getSection(start)
      start++
    } catch (err) {
      return { err, stop: start }
    }
  }
}

async function backwardsBefore (start, output) {
  while (true) {
    try {
      start--
      output[start] = await getSection(start)
    } catch (err) {
      return { err, stop: start }
    }
  }
}

async function main (start = 579_519) {
  // I think 569 350 is the biggest?
  const output = {}
  window.output = output
  {
    const { err, stop } = await forwardsFrom(start, output)
    console.error(err, 'at', stop)
  }
  {
    const { err, stop } = await backwardsBefore(start, output)
    console.error(err, 'at', stop)
  }
  return output
}
