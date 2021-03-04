// Guided by the wisdom of Zod: https://github.com/colinhacks/zod/blob/bb93ec5448d4b06ef3a458160e697babb2059980/src/types/tuple.ts#L52

abstract class Dumb<T> {
  // test: (x: unknown) => T = 3
}

class Tuple<
  T extends [any, ...any[]]
> extends Dumb<T> {
  constructor (validate: T) {
    super()
  }
}

class ArrayThing<T> {
  constructor (wow: () => T[], validate: (value: unknown) => value is T) {
    //
  }
}

const test2 = new ArrayThing(() => [], (value): value is string | number => true)

const test = new Tuple([
  3,
  'two',
  true
])

class Tuple2<R extends [any, ...any[]] | [], T> {
  validateFirst: (value: unknown) => value is T
  validateRest: (value: unknown[]) => value is R

  constructor (validateFirst: (value: unknown) => value is T, validateRest: (value: unknown[]) => value is R) {
    this.validateFirst = validateFirst
    this.validateRest = validateRest
  }

  static from<
    T extends [(value: unknown) => value is any, ...((value: unknown) => value is any)[]]
  > (validators: T) {
    // const [first, ...rest] = validators
    // return new Tuple2(first, (value: unknown[]): value is typeof rest => {
    //   return true
    // })
  }
}

type TupleValidators = [(value: unknown) => value is any, ...((value: unknown) => value is any)[]]

class Tuple3<T extends [any, ...any[]] | []> {
  constructor (validators: {
    [index in keyof T]: (value: unknown) => value is T[index]
  }) {
    //
  }
}

new Tuple3([
  (value): value is number => true,
  (value): value is string => true,
])

function wowTest (lol: [number, string, boolean]) {
  lol.forEach((value, index) => {
    //
  })
}


















//
