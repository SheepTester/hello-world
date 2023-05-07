// math doer
int64_t func1373(int64_t add_thing, int64_t start) {
  int64_t timer = start;
  int64_t result = 0;
  int64_t t1, t2, t3;

  // shifting binds loosely
  for (int i = 0; i < 64; i++) {
    t1 = result * 2;
    t3 = (t1 * 0x23B3 >> 64);
    result = (t1 - t3 >> 1) + t3 >> 62;
    result = t1 - result * 0x7FFFFFFFFFFFEE27;
    if (timer < 0) { // so timer is signed
      t2 = result + add_thing;
      result = (t2 - (t2 * 0x23B3 >> 64) >> 1) + (t2 * 0x23B3 >> 64) >> 62;
      result = t2 - result * 0x7FFFFFFFFFFFEE27;
    }
    timer *= 2;
  }
  return result;
}

int64_t sub_1373(int64_t a1, int64_t a2) {
  int64_t v2;
  int64_t v3;
  int64_t result = 0;
  for (int i = 0; i <= 63; ++i) {
    v2 = (0x23B3 * (2 * result)) >> 64;
    result = 2 * result -
             0x7FFFFFFFFFFFEE27 * ((v2 + ((2 * result - v2) >> 1)) >> 62);
    if (a2 < 0) {
      v3 = (0x23B3 * (result + a1)) >> 64;
      result = result + a1 -
               0x7FFFFFFFFFFFEE27 * ((v3 + ((result + a1 - v3) >> 1)) >> 62);
    }
    a2 *= 2;
  }
  return result;
}

int64_t function_1373(int64_t a1, int64_t a2) {
  int32_t i = 0;      // 0x142e
  int64_t timer = a2; // 0x1373
  // int64_t v3 = 0;     // 0x139b
  // int64_t v4 = v3;    // 0x13e1
  for (i = 0; i < 64; i++) {
    // 0x1397
    // v3 = 2 * result;
    // v4 = 2 * result;
    // if (timer < 0) {
    //   // 0x13e3
    // }
    // v4 = timer < 0 ? 2 * result + a1 : 2 * result;
    // 0x142a
    result = timer < 0 ? 2 * result + a1 : 2 * result;
    i++;
    timer *= 2;
  }
  // 0x143c
  return result;
}

int func15b3(void *buf, unsigned long size, unsigned long long *arg) {
  unsigned int found = 0; // [bp-0x1c]
  // unsigned long long *ptr = buf;      // [bp-0x18]
  // unsigned long end = buf + size - 8; // [bp-0x10]

  // advance pointer by a unit
  for (unsigned long long *ptr = buf; ptr <= buf + size - 8; ptr = &ptr[1]) {
    // so ptr has to equal arg?
    if (*(ptr) == *(arg)) {
      found = 1;
      break;
    }
  }
  if (found == 0) {
    exit(0x2); /* do not return */
  }
  // copies 32 bytes from arg to pointer ??
  return (unsigned int)memcpy(ptr, arg, 0x20);
}

// file writer
int64_t func1645(int64_t *arg) {
  // basically, this just writes 32 bytes from arg to the file
  // so i dont think it's that relevant
  func15B3(buf, size, arg);
  write(file, buf, size);
}

// if *0x3038 != 0x73B8E98D1B3879A2:
// v0 = func1309() -> 8 random bytes (64-bit int)
// *0x3030 = func1373(*0x3030, v0)
// *0x3028 = func1373(func1373(*0x3028, 11), v0)
// ++*0x3038
// func1645(*0x3020)
