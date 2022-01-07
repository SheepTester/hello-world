// NO LONGER USED, I THINK I HAVE A BETTER IDEA

// From https://github.com/SheepTester/uxdy/blob/main/webreg-scraping/scrape.rb

function raise (error) {
  throw error
}

export class AuthorizedGetter {
  constructor (sessionIndex, uqz) {
    this.sessionIndex = sessionIndex
    this.uqz = uqz
  }

  async get (path, query = {}) {
    return fetch(
      `https://act.ucsd.edu/webreg2/svc/wradapter/secure/${path}?${new URLSearchParams(
        query
      )}`,
      {
        headers: {
          Cookie: `jlinksessionidx=${this.sessionIndex}; UqZBpD3n=${this.uqz}`
        }
      }
    ).then(r => r.json())
  }
}

export class Course {
  constructor (rawCourse, rawGroups) {
    if (
      Object.keys(rawCourse).join(' ') !==
      'UNIT_TO SUBJ_CODE UNIT_INC CRSE_TITLE UNIT_FROM CRSE_CODE'
    ) {
      throw new TypeError('Course keys do not match my expectations.')
    }

    this.subject = rawCourse.SUBJ_CODE.trim()
    this.course = rawCourse.CRSE_CODE.trim()
    this.title = rawCourse.CRSE_TITLE.trim()
    this.unit = {
      from: rawCourse.UNIT_FROM,
      inc: rawCourse.UNIT_INC,
      to: rawCourse.UNIT_TO
    }

    this.groups = rawGroups.map(group => new Group(group))
  }
}

function parseYn (yn, no) {
  if (yn === 'Y') {
    return true
  } else if (yn === no) {
    return false
  } else {
    throw new TypeError(`'${yn}' is neither 'Y' nor '${no}'`)
  }
}

// https://registrar.ucsd.edu/StudentLink/instr_codes.html
const groupTypes = {
  '  ': 'default',
  FI: 'final-exam',
  TBA: 'to-be-announced',
  MI: 'midterm',
  MU: 'make-up-session',
  RE: 'review-session',
  PB: 'problem-session',
  OT: 'other-additional-meeting'
}
const instructionTypes = {
  DI: 'discussion',
  LE: 'lecture',
  SE: 'seminar',
  PR: 'practicum',
  IN: 'independent study',
  IT: 'internship',
  FW: 'fieldwork',
  LA: 'lab',
  CL: 'clinical clerkship',
  TU: 'tutorial',
  CO: 'conference',
  ST: 'studio',
  OP: 'idk',
  OT: 'other additional meeting',
  SA: 'what'
}
export class Group {
  constructor (rawGroup) {
    if (
      Object.keys(rawGroup).join(' ') !==
      'END_MM_TIME SCTN_CPCTY_QTY LONG_DESC SCTN_ENRLT_QTY BEGIN_HH_TIME SECTION_NUMBER SECTION_START_DATE STP_ENRLT_FLAG SECTION_END_DATE COUNT_ON_WAITLIST PRIMARY_INSTR_FLAG BEFORE_DESC ROOM_CODE END_HH_TIME START_DATE DAY_CODE BEGIN_MM_TIME PERSON_FULL_NAME FK_SPM_SPCL_MTG_CD PRINT_FLAG BLDG_CODE FK_SST_SCTN_STATCD FK_CDI_INSTR_TYPE SECT_CODE AVAIL_SEAT'
    ) {
      throw new TypeError('Group keys do not match my expectations.')
    }

    this.code = rawGroup.SECT_CODE

    this.start = rawGroup.BEGIN_HH_TIME * 60 + rawGroup.BEGIN_MM_TIME
    this.end = rawGroup.END_HH_TIME * 60 + rawGroup.END_MM_TIME
    this.days = rawGroup.DAY_CODE.split('').map(Number)

    this.building = rawGroup.BLDG_CODE
    this.room = rawGroup.ROOM_CODE
    this.instructors =
      rawGroup.PERSON_FULL_NAME.trim() !== ''
        ? rawGroup.PERSON_FULL_NAME.split(':').map(instructor => {
            const [name, pid] = instructor.split(';').map(str => str.trim())
            return { name, pid }
          })
        : []

    this.capacity =
      rawGroup.SCTN_CPCTY_QTY === 9999 ? Infinity : rawGroup.SCTN_CPCTY_QTY
    this.enrolled = rawGroup.SCTN_ENRLT_QTY
    this.available = rawGroup.AVAIL_SEAT
    this.waitlist = rawGroup.COUNT_ON_WAITLIST
    this.canEnrol = !parseYn(rawGroup.STP_ENRLT_FLAG, 'N')

    // Date range of quarter
    this.startDate = rawGroup.SECTION_START_DATE
    this.endDate = rawGroup.SECTION_END_DATE

    this.groupType =
      groupTypes[rawGroup.FK_SPM_SPCL_MTG_CD] ??
      raise(
        new ReferenceError(
          `'${rawGroup.FK_SPM_SPCL_MTG_CD}' is not a group type`
        )
      )
    this.instructionType =
      instructionTypes[rawGroup.FK_CDI_INSTR_TYPE] ??
      raise(
        new ReferenceError(
          `'${rawGroup.FK_CDI_INSTR_TYPE}' is not a instruction type`
        )
      )
    this.beforeDescription = rawGroup.BEFORE_DESC
    this.description = rawGroup.LONG_DESC
    this.sectionId = rawGroup.SECTION_NUMBER
    this.isPrimaryInstructor = parseYn(rawGroup.PRIMARY_INSTR_FLAG, ' ')
    this.sstSectionStatisticId = rawGroup.FK_SST_SCTN_STATCD
    this.printFlag = rawGroup.PRINT_FLAG
  }
}
