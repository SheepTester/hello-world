/** An integer as a string. */
type Int = `${number}`

/** A boolean as a number. */
type Bool = 0 | 1

type Contact = [
  id: Int, // [0] 21-char contact ID, eg 101956614768020908698
  _: [
    _: null,
    _: null,
    _: null,
    id: Int, // [3] same as Contact.id
    _: null,
    chatId: [id: Int] | null, // [5] contains the Google Chat ID, eg 3595140437256898935
    _: null,
    _: null,
    _: null,
    _: null,
    _: null,
    _: true, // [11]
    _: (1 | 2 | 4)[], // [12] either [1, 4] or [1, 2, 4] (later only has 2k and possibly for staff)
    _: null,
    _: null,
    chatTime: Int | null, // [15] millisecond timestamp of Chat contact, eg 1629998105788
    _: null,
    _: null,
    _: null,
    _: null,
    _: null,
    _: [
      fromChat: Bool, // [0]
      id: Int, // [1] same as Contact[0]
      _: null,
      ...rest: NormalContactData | ChatContactData // [3+] depending on if it's a Chat contact
    ][], // [21]
    _: unknown
  ], // [1]
  _: unknown
]

type NormalContactData = [
  chatTime: null,
  groupId: string, // [4] same for all normal contacts, eg #42WmSpB8rSM=
  _: 1
]
type ChatContactData = [
  chatTime: number, // [3] microsecond timestamp, slightly before Contact[1].charTime, eg 1629998105005457
  groupId: string, // [4] same ID corresponds to same [3], eg #42WmSpB8rSM=
  _: 2,
  _: [] // [6]
]

// TODO
