// math doer
int func1373(unsigned long a0, unsigned long long a1) {
  unsigned long long v0; // [bp-0x28]
  unsigned int i;        // [bp-0x14]
  // [bp-0x10], Other Possible Types: unsigned long, unsigned long long
  void *result;
  void *v4;              // rcx
  unsigned long long v6; // rcx

  v0 = a1;
  result = 0;
  for (unsigned int i = 0; i < 64; i++) {
    v4 = result * 2;
    result = (result * 2 - ((result * 2) * 9139 >> 64) >> 1) +
                 ((result * 2) * 9139 >> 64) >>
             62;
    result = v4 - result * 9223372036854771239;
    if (v0 < 0) {
      v6 = result + a0;
      result = (result + a0 - ((result + a0) * 9139 >> 64) >> 1) +
                   ((result + a0) * 9139 >> 64) >>
               62;
      result = v6 - result * 9223372036854771239;
    }
    v0 *= 2;
  }
  return (unsigned int)result;
}

__int64 __fastcall sub_1373(__int64 a1, __int64 a2) {
  __int64 v2;     // rdx
  __int64 v3;     // rdx
  int i;          // [rsp+14h] [rbp-Ch]
  __int64 result; // [rsp+18h] [rbp-8h]

  result = 0;
  for (i = 0; i <= 63; ++i) {
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
// v0 = func1309() -> 8 random bytes
// v3 = func1373(*0x3030, v0)
// v2 = func1373(func1373(*0x3028, 11), v0)
// ++*0x3038
// func1645(*0x3020)
