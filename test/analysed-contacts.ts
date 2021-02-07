type Type = 0 | 1 | 7

export interface Contact {
  id: string // [0]
  metadata: Metadata // [1]
  names: Name[] // [2]
  pfps: ProfilePicture[] // [3]
  emails: Email[] // [9]
  phones: PhoneNumber[] // [11]
  jobs: Job[] // [12]
  cities: City[] // [13]
  group: string // [25]
}

// [1]
export interface Metadata {
  // Assertions:
  // [3] === root[0]

  otherId?: string // [5]
  inMyContacts: boolean // [8]
  group254: boolean // [12]
  isMe: boolean // [12]
  timestamp?: string // [15]
  group204?: Group204 // [21]
}

// [1][21]
export interface Group204 {
  // Assertions:
  // [2] === root[0]
  // [0] and [5] must correlate with (0, 1), (1, 2), (7, 7)

  timestamp: number // [3]
  encodedTimestamp: string // [4]
}

// [2][i]
export interface Name {
  // [0][0] is true iff [0][14] === 2
  // [0][1] and [0][14] must correlate with (0, 1), (1, 2), (7, 7)
  // [0][8] === root[0], if not group 50

  type: Type // [0][1]
  isFirst: boolean // [0][2]
  // [1] === [15]
  fullName: string // [1]
  firstName: string // [3]
  lastName?: string // [4]
  lastFirstName: string // [12]
  certainStaff: boolean // [5]
  group50?: Group50 // [0] IF [0][14] === 2
}

// [2][i][0]
export interface Group50 {
  otherId: string // [7]
  hex: string // [8]
}

// [3][i]
export interface ProfilePicture {
  // Assertions:
  // [0][0] is null if root[3].length === 1
  // [0][1] and [0][14] must correlate with (0, 1), (1, 2), (7, 7)
  // [0][8] === root[0] IF [0][0] IS FALSY

  type: Type // [0][1]
  isZero: boolean // [0][5]
  otherId?: { // IF [0][0] IS TRUTHY
    id: string // [0][7]
    hex: string // [0][8]
  }
  url: string // [1]
  base64: string // [3]
  colour?: string // [7]
}

// [9][i]
export interface Email {
  // Assertions
  // [0][1] and [0][14] must correlate with (0, 1), (1, 2), (7, 7)
  // [12][0][0] === root[0] if it exists

  type: Type // [0][1]
  email: string // [1]
  emailType?: 'work' | 'home' | 'other' // [2]
}

// [11][i]
export interface PhoneNumber {
  // Assertions
  // [0][0][8] === root[0] if [0][0][0] IS null

  strangeId?: string // [0][0][7]
  hex?: string // [0][0][8] if [0][0][0] IS true
  dashedPhone: string // [1]
  plusPhone: string // [2]
  phoneUri: string // [6]
}

// [12][i]
export interface Job {
  // Assertions
  // Exactly one of [1] and [2] should be null.
  // [26][1], [26][2], [27][1], [27][2] should be 1 if they exist.
  // [0][1] and [0][14] must correlate with (0, 1), (1, 2), (7, 7)
  // [0][8] === root[0]

  type: Type // [0][1]
  location?: string // [1] or [2]
  title?: string // [3]
  desc?: string // [7]
  id?: 1 | 2 // [9]
  jobType: 'work' | 'school' // [16]
  year?: number // [27][0]
  yearAlt?: number // [26][0]
}

// [13][i]
export interface City {
  city: string // [1]
  current: boolean // [2]
}
