/* This file was generated by the Hex-Rays decompiler version 8.2.0.221215.
   Copyright (c) 2007-2021 Hex-Rays <info@hex-rays.com>

   Detected compiler: GNU C++
*/

#include "defs.h"

//-------------------------------------------------------------------------
// Function declarations

__int64 (**init_proc())(void);
void sub_1020();
void sub_1030();
void sub_1040();
void sub_1050();
void sub_1060();
void sub_1070();
void sub_1080();
void sub_1090();
void sub_10A0();
void sub_10B0();
void sub_10C0();
void sub_10D0();
void sub_10E0();
void sub_10F0();
void sub_1100();
void sub_1110();
// int __fastcall _cxa_finalize(void *);
// void free(void *ptr);
// int puts(const char *s);
// ssize_t write(int fd, const void *buf, size_t n);
// int printf(const char *format, ...);
// int snprintf(char *s, size_t maxlen, const char *format, ...);
// __off_t lseek(int fd, __off_t offset, int whence);
// int close(int fd);
// ssize_t read(int fd, void *buf, size_t nbytes);
// void *memcpy(void *dest, const void *src, size_t n);
// void *malloc(size_t size);
// int open(const char *file, int oflag, ...);
// void perror(const char *s);
// void __noreturn exit(int status);
// __int64 __fastcall getrandom(_QWORD, _QWORD, _QWORD); weak
void __fastcall __noreturn start(__int64 a1, __int64 a2, void (*a3)(void));
char *sub_1250();
__int64 sub_1280();
char *sub_12C0();
__int64 sub_1300();
__int64 sub_1309();
__int64 __fastcall sub_1373(__int64 a1, __int64 a2);
__int64 __fastcall sub_1442(unsigned __int64 a1);
__off_t __fastcall sub_1533(int a1);
void *__fastcall sub_15B3(_QWORD *a1, __int64 a2, _QWORD *a3);
unsigned __int64 __fastcall sub_1645(_QWORD *a1);
unsigned __int64 sub_1830();
void term_proc();
// int __fastcall _libc_start_main(int (__fastcall *main)(int, char **, char
// **), int argc, char **ubp_av, void (*init)(void), void (*fini)(void), void
// (*rtld_fini)(void), void *stack_end); int __fastcall __cxa_finalize(void *);
// __int64 _gmon_start__(void); weak

//-------------------------------------------------------------------------
// Data declarations

_UNKNOWN main;
void *off_4008 = &off_4008;                 // idb
__int64 qword_4020 = 6456472665565383409LL; // weak
__int64 qword_4028 = 9185886995572187467LL; // weak
__int64 qword_4030 = 7283932321524483616LL; // weak
__int64 qword_4038 = 131LL;                 // weak
char byte_4040;                             // weak

//----- (0000000000001000) ----------------------------------------------------
__int64 (**init_proc())(void) {
  __int64 (**result)(void); // rax

  result = &_gmon_start__;
  if (&_gmon_start__)
    return (__int64 (**)(void))_gmon_start__();
  return result;
}
// 40D8: using guessed type __int64 _gmon_start__(void);

//----- (0000000000001020) ----------------------------------------------------
void sub_1020() { JUMPOUT(0LL); }
// 1026: control flows out of bounds to 0

//----- (0000000000001030) ----------------------------------------------------
void sub_1030() { sub_1020(); }

//----- (0000000000001040) ----------------------------------------------------
void sub_1040() { sub_1020(); }

//----- (0000000000001050) ----------------------------------------------------
void sub_1050() { sub_1020(); }

//----- (0000000000001060) ----------------------------------------------------
void sub_1060() { sub_1020(); }

//----- (0000000000001070) ----------------------------------------------------
void sub_1070() { sub_1020(); }

//----- (0000000000001080) ----------------------------------------------------
void sub_1080() { sub_1020(); }

//----- (0000000000001090) ----------------------------------------------------
void sub_1090() { sub_1020(); }

//----- (00000000000010A0) ----------------------------------------------------
void sub_10A0() { sub_1020(); }

//----- (00000000000010B0) ----------------------------------------------------
void sub_10B0() { sub_1020(); }

//----- (00000000000010C0) ----------------------------------------------------
void sub_10C0() { sub_1020(); }

//----- (00000000000010D0) ----------------------------------------------------
void sub_10D0() { sub_1020(); }

//----- (00000000000010E0) ----------------------------------------------------
void sub_10E0() { sub_1020(); }

//----- (00000000000010F0) ----------------------------------------------------
void sub_10F0() { sub_1020(); }

//----- (0000000000001100) ----------------------------------------------------
void sub_1100() { sub_1020(); }

//----- (0000000000001110) ----------------------------------------------------
void sub_1110() { sub_1020(); }

//----- (0000000000001220) ----------------------------------------------------
// positive sp value has been detected, the output may be wrong!
void __fastcall __noreturn start(__int64 a1, __int64 a2, void (*a3)(void)) {
  __int64 v3;    // rax
  int v4;        // esi
  __int64 v5;    // [rsp-8h] [rbp-8h] BYREF
  char *retaddr; // [rsp+0h] [rbp+0h] BYREF

  v4 = v5;
  v5 = v3;
  _libc_start_main((int(__fastcall *)(int, char **, char **))main, v4, &retaddr,
                   0LL, 0LL, a3, &v5);
  __halt();
}
// 122A: positive sp value 8 has been found
// 1231: variable 'v3' is possibly undefined

//----- (0000000000001250) ----------------------------------------------------
char *sub_1250() { return &byte_4040; }
// 4040: using guessed type char byte_4040;

//----- (0000000000001280) ----------------------------------------------------
__int64 sub_1280() { return 0LL; }

//----- (00000000000012C0) ----------------------------------------------------
char *sub_12C0() {
  char *result; // rax

  if (!byte_4040) {
    if (&__cxa_finalize)
      _cxa_finalize(off_4008);
    result = sub_1250();
    byte_4040 = 1;
  }
  return result;
}
// 4040: using guessed type char byte_4040;

//----- (0000000000001300) ----------------------------------------------------
// attributes: thunk
__int64 sub_1300() { return sub_1280(); }

//----- (0000000000001309) ----------------------------------------------------
__int64 sub_1309() {
  __int64 v1[2]; // [rsp+0h] [rbp-10h] BYREF

  v1[1] = __readfsqword(0x28u);
  if (getrandom(v1, 8LL, 0LL) != 8) {
    puts("Some error occurred");
    exit(1);
  }
  return v1[0];
}
// 1210: using guessed type __int64 __fastcall getrandom(_QWORD, _QWORD,
// _QWORD);

//----- (0000000000001373) ----------------------------------------------------
__int64 __fastcall sub_1373(__int64 a1, __int64 a2) {
  __int64 v2; // rdx
  __int64 v3; // rdx
  int i;      // [rsp+14h] [rbp-Ch]
  __int64 v7; // [rsp+18h] [rbp-8h]

  v7 = 0LL;
  for (i = 0; i <= 63; ++i) {
    v2 = (0x23B3 * (unsigned __int128)(unsigned __int64)(2 * v7)) >> 64;
    v7 = 2 * v7 - 0x7FFFFFFFFFFFEE27LL *
                      ((v2 + ((unsigned __int64)(2 * v7 - v2) >> 1)) >> 62);
    if (a2 < 0) {
      v3 = (0x23B3 * (unsigned __int128)(unsigned __int64)(v7 + a1)) >> 64;
      v7 = v7 + a1 -
           0x7FFFFFFFFFFFEE27LL *
               ((v3 + ((unsigned __int64)(v7 + a1 - v3) >> 1)) >> 62);
    }
    a2 *= 2LL;
  }
  return v7;
}

//----- (0000000000001442) ----------------------------------------------------
__int64 __fastcall sub_1442(unsigned __int64 a1) {
  __int64 v1;          // rax
  __int64 v2;          // rdx
  __int64 v4;          // [rsp+10h] [rbp-38h]
  unsigned __int64 v5; // [rsp+18h] [rbp-30h]
  __int64 v6;          // [rsp+20h] [rbp-28h]
  unsigned __int64 v8; // [rsp+38h] [rbp-10h]
  __int64 v9;          // [rsp+40h] [rbp-8h]

  v4 = 0LL;
  v5 = 0x7FFFFFFFFFFFEE27LL;
  v6 = 1LL;
  while (a1) {
    v8 = v5 % a1;
    v9 = v6;
    v1 = sub_1373(v5 / a1, 0x7FFFFFFFFFFFEE27LL - v6);
    v2 = (0x23B3 * (unsigned __int128)(unsigned __int64)(v1 + v4)) >> 64;
    v6 = v1 + v4 -
         0x7FFFFFFFFFFFEE27LL *
             ((v2 + ((unsigned __int64)(v1 + v4 - v2) >> 1)) >> 62);
    v4 = v9;
    v5 = a1;
    a1 = v8;
  }
  return v4;
}

//----- (0000000000001533) ----------------------------------------------------
__off_t __fastcall sub_1533(int a1) {
  __off_t v2; // [rsp+18h] [rbp-8h]

  v2 = lseek(a1, 0LL, 2);
  if (v2 == -1) {
    perror("Cannot determine file size");
    exit(1);
  }
  if (lseek(a1, 0LL, 0) == -1) {
    perror("Cannot rewind");
    exit(1);
  }
  return v2;
}

//----- (00000000000015B3) ----------------------------------------------------
void *__fastcall sub_15B3(_QWORD *a1, __int64 a2, _QWORD *a3) {
  int v4;       // [rsp+2Ch] [rbp-14h]
  _QWORD *dest; // [rsp+30h] [rbp-10h]

  dest = a1;
  v4 = 0;
  while (dest <= (_QWORD *)((char *)a1 + a2 - 8)) {
    if (*dest == *a3) {
      v4 = 1;
      break;
    }
    ++dest;
  }
  if (!v4)
    exit(2);
  return memcpy(dest, a3, 0x20uLL);
}

//----- (0000000000001645) ----------------------------------------------------
unsigned __int64 __fastcall sub_1645(_QWORD *a1) {
  int fd;               // [rsp+10h] [rbp-50h]
  int v3;               // [rsp+14h] [rbp-4Ch]
  __off_t size;         // [rsp+18h] [rbp-48h]
  _QWORD *buf;          // [rsp+20h] [rbp-40h]
  ssize_t v6;           // [rsp+28h] [rbp-38h]
  char file[8];         // [rsp+30h] [rbp-30h] BYREF
  __int64 v8;           // [rsp+38h] [rbp-28h]
  __int64 v9;           // [rsp+40h] [rbp-20h]
  __int16 v10;          // [rsp+48h] [rbp-18h]
  unsigned __int64 v11; // [rsp+58h] [rbp-8h]

  v11 = __readfsqword(0x28u);
  fd = open("/proc/self/exe", 0);
  if (fd == -1) {
    perror("Unable to open myself");
    exit(1);
  }
  size = sub_1533(fd);
  *(_QWORD *)file = 0x2D6C6C6F64LL;
  v8 = 0LL;
  v9 = 0LL;
  v10 = 0;
  snprintf(&file[5], 0x15uLL, "%llu", a1[3]);
  v3 = open(file, 193, 448LL);
  if (v3 == -1) {
    perror("Unable to create new doll");
    exit(1);
  }
  buf = malloc(size);
  if (!buf) {
    puts("malloc() failed!");
    exit(1);
  }
  v6 = read(fd, buf, size);
  if (v6 <= 0 || v6 != size) {
    puts("Something went wrong while reading myself!");
    exit(1);
  }
  sub_15B3(buf, size, a1);
  if (write(v3, buf, size) == -1) {
    perror("Error copying doll");
    exit(1);
  }
  free(buf);
  close(v3);
  close(fd);
  return v11 - __readfsqword(0x28u);
}

//----- (0000000000001830) ----------------------------------------------------
unsigned __int64 sub_1830() {
  __int64 v0;          // rax
  __int64 v2;          // [rsp+10h] [rbp-20h]
  __int64 v3;          // [rsp+1Fh] [rbp-11h] BYREF
  char v4;             // [rsp+27h] [rbp-9h]
  unsigned __int64 v5; // [rsp+28h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  v0 = sub_1442(qword_4030);
  v2 = sub_1373(qword_4028, v0);
  v3 = sub_1373(0x888BE665BFB73F2LL, v2);
  v4 = 0;
  puts("Congrats! You found the flag:");
  printf("sdctf{%s_%llu}\n", (const char *)&v3, v2);
  return v5 - __readfsqword(0x28u);
}
// 4028: using guessed type __int64 qword_4028;
// 4030: using guessed type __int64 qword_4030;

//----- (00000000000018E1) ----------------------------------------------------
__int64 __fastcall main(int a1, char **a2, char **a3) {
  __int64 v4;           // rax
  __int64 v5;           // [rsp+8h] [rbp-38h]
  __int64 v6;           // [rsp+10h] [rbp-30h] BYREF
  __int64 v7;           // [rsp+18h] [rbp-28h]
  __int64 v8;           // [rsp+20h] [rbp-20h]
  __int64 v9;           // [rsp+28h] [rbp-18h]
  unsigned __int64 v10; // [rsp+38h] [rbp-8h]

  v10 = __readfsqword(0x28u);
  if (qword_4038 == 0x73B8E98D1B3879A2LL) {
    sub_1830();
  } else {
    printf("Unwrapping the %llu-th doll\n", qword_4038 + 1);
    v6 = qword_4020;
    v7 = qword_4028;
    v9 = qword_4038;
    v5 = sub_1309();
    v8 = sub_1373(qword_4030, v5);
    v4 = sub_1373(v7, 11LL);
    v7 = sub_1373(v4, v5);
    ++v9;
    sub_1645(&v6);
  }
  return 0LL;
}
// 4020: using guessed type __int64 qword_4020;
// 4028: using guessed type __int64 qword_4028;
// 4030: using guessed type __int64 qword_4030;
// 4038: using guessed type __int64 qword_4038;

//----- (00000000000019EC) ----------------------------------------------------
void term_proc() { ; }

// nfuncs=65 queued=31 decompiled=31 lumina nreq=0 worse=0 better=0
// ALL OK, 31 function(s) have been successfully decompiled
