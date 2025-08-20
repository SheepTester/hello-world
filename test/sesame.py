# uncompyle6 version 3.5.0
# Python bytecode 3.8 (3413)
# Decompiled from: Python 2.7.5 (default, Nov 16 2020, 22:23:17)
# [GCC 4.8.5 20150623 (Red Hat 4.8.5-44)]
# Embedded file name: sesame.py
# Size of source mod 2**32: 1295 bytes
MOD = 131
FLAG_LEN = 36
DOOR_SHAPE = [94, 68, 98, 110, 45, 81, 6, 76, 119, 53, 16, 19, 122, 91, 51, 44, 13, 35, 2, 124, 83, 101, 75, 122, 75, 124, 37, 8, 127, 0, 22, 130, 11, 42, 114, 19]

def gencave(flaglen):
    cave = []
    ps = []
    i = 1
    while len(cave) <= flaglen:
        i += 1
        skip = False
        for p in ps:
            if i % p == 0:
                skip = True
        if skip:
            continue
        ps.append(i)
        if not cave or len(cave[(-1)]) >= flaglen:
            cave.append([])
        cave[(-1)].append(i % MOD)

    cave = cave[:-1]
    return cave


def door(cave, word: str) -> bool:
    if not (word.isascii() and len(word) == FLAG_LEN):
        return False
    else:
        code = list(magic_words.encode())
        m = magic(cave, code)
        return m == DOOR_SHAPE


def magic(a, b):
    return [sum(a[i][j] * b[j] for j in range(FLAG_LEN)) % MOD for i in range(FLAG_LEN)]


if __name__ == '__main__':
    cave = gencave(FLAG_LEN)
    print(cave)
    print(len(cave), [len(c) for c in cave])
    magic_words = input('Enter the magic words (the flag) to get the treasure (points): ')
    print('You got the flag! Get the treasure by submitting it.' if door(cave, magic_words) else 'This is not the flag :(')
