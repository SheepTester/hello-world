
/mnt/c/Users/seant/Downloads/doll:     file format elf64-x86-64


Disassembly of section .init:

0000000000001000 <.init>:
    1000:	f3 0f 1e fa          	endbr64
    1004:	48 83 ec 08          	sub    rsp,0x8
    1008:	48 8b 05 d9 2f 00 00 	mov    rax,QWORD PTR [rip+0x2fd9]        # 3fe8 <getrandom@plt+0x2dd8>
    100f:	48 85 c0             	test   rax,rax
    1012:	74 02                	je     1016 <__cxa_finalize@plt-0x10a>
    1014:	ff d0                	call   rax
    1016:	48 83 c4 08          	add    rsp,0x8
    101a:	c3                   	ret

Disassembly of section .plt:

0000000000001020 <.plt>:
    1020:	ff 35 2a 2f 00 00    	push   QWORD PTR [rip+0x2f2a]        # 3f50 <getrandom@plt+0x2d40>
    1026:	f2 ff 25 2b 2f 00 00 	bnd jmp QWORD PTR [rip+0x2f2b]        # 3f58 <getrandom@plt+0x2d48>
    102d:	0f 1f 00             	nop    DWORD PTR [rax]
    1030:	f3 0f 1e fa          	endbr64
    1034:	68 00 00 00 00       	push   0x0
    1039:	f2 e9 e1 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    103f:	90                   	nop
    1040:	f3 0f 1e fa          	endbr64
    1044:	68 01 00 00 00       	push   0x1
    1049:	f2 e9 d1 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    104f:	90                   	nop
    1050:	f3 0f 1e fa          	endbr64
    1054:	68 02 00 00 00       	push   0x2
    1059:	f2 e9 c1 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    105f:	90                   	nop
    1060:	f3 0f 1e fa          	endbr64
    1064:	68 03 00 00 00       	push   0x3
    1069:	f2 e9 b1 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    106f:	90                   	nop
    1070:	f3 0f 1e fa          	endbr64
    1074:	68 04 00 00 00       	push   0x4
    1079:	f2 e9 a1 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    107f:	90                   	nop
    1080:	f3 0f 1e fa          	endbr64
    1084:	68 05 00 00 00       	push   0x5
    1089:	f2 e9 91 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    108f:	90                   	nop
    1090:	f3 0f 1e fa          	endbr64
    1094:	68 06 00 00 00       	push   0x6
    1099:	f2 e9 81 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    109f:	90                   	nop
    10a0:	f3 0f 1e fa          	endbr64
    10a4:	68 07 00 00 00       	push   0x7
    10a9:	f2 e9 71 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    10af:	90                   	nop
    10b0:	f3 0f 1e fa          	endbr64
    10b4:	68 08 00 00 00       	push   0x8
    10b9:	f2 e9 61 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    10bf:	90                   	nop
    10c0:	f3 0f 1e fa          	endbr64
    10c4:	68 09 00 00 00       	push   0x9
    10c9:	f2 e9 51 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    10cf:	90                   	nop
    10d0:	f3 0f 1e fa          	endbr64
    10d4:	68 0a 00 00 00       	push   0xa
    10d9:	f2 e9 41 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    10df:	90                   	nop
    10e0:	f3 0f 1e fa          	endbr64
    10e4:	68 0b 00 00 00       	push   0xb
    10e9:	f2 e9 31 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    10ef:	90                   	nop
    10f0:	f3 0f 1e fa          	endbr64
    10f4:	68 0c 00 00 00       	push   0xc
    10f9:	f2 e9 21 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    10ff:	90                   	nop
    1100:	f3 0f 1e fa          	endbr64
    1104:	68 0d 00 00 00       	push   0xd
    1109:	f2 e9 11 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    110f:	90                   	nop
    1110:	f3 0f 1e fa          	endbr64
    1114:	68 0e 00 00 00       	push   0xe
    1119:	f2 e9 01 ff ff ff    	bnd jmp 1020 <__cxa_finalize@plt-0x100>
    111f:	90                   	nop

Disassembly of section .plt.got:

0000000000001120 <__cxa_finalize@plt>:
    1120:	f3 0f 1e fa          	endbr64
    1124:	f2 ff 25 cd 2e 00 00 	bnd jmp QWORD PTR [rip+0x2ecd]        # 3ff8 <getrandom@plt+0x2de8>
    112b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

Disassembly of section .plt.sec:

0000000000001130 <free@plt>:
    1130:	f3 0f 1e fa          	endbr64
    1134:	f2 ff 25 25 2e 00 00 	bnd jmp QWORD PTR [rip+0x2e25]        # 3f60 <getrandom@plt+0x2d50>
    113b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001140 <puts@plt>:
    1140:	f3 0f 1e fa          	endbr64
    1144:	f2 ff 25 1d 2e 00 00 	bnd jmp QWORD PTR [rip+0x2e1d]        # 3f68 <getrandom@plt+0x2d58>
    114b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001150 <write@plt>:
    1150:	f3 0f 1e fa          	endbr64
    1154:	f2 ff 25 15 2e 00 00 	bnd jmp QWORD PTR [rip+0x2e15]        # 3f70 <getrandom@plt+0x2d60>
    115b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001160 <__stack_chk_fail@plt>:
    1160:	f3 0f 1e fa          	endbr64
    1164:	f2 ff 25 0d 2e 00 00 	bnd jmp QWORD PTR [rip+0x2e0d]        # 3f78 <getrandom@plt+0x2d68>
    116b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001170 <printf@plt>:
    1170:	f3 0f 1e fa          	endbr64
    1174:	f2 ff 25 05 2e 00 00 	bnd jmp QWORD PTR [rip+0x2e05]        # 3f80 <getrandom@plt+0x2d70>
    117b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001180 <snprintf@plt>:
    1180:	f3 0f 1e fa          	endbr64
    1184:	f2 ff 25 fd 2d 00 00 	bnd jmp QWORD PTR [rip+0x2dfd]        # 3f88 <getrandom@plt+0x2d78>
    118b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001190 <lseek@plt>:
    1190:	f3 0f 1e fa          	endbr64
    1194:	f2 ff 25 f5 2d 00 00 	bnd jmp QWORD PTR [rip+0x2df5]        # 3f90 <getrandom@plt+0x2d80>
    119b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

00000000000011a0 <close@plt>:
    11a0:	f3 0f 1e fa          	endbr64
    11a4:	f2 ff 25 ed 2d 00 00 	bnd jmp QWORD PTR [rip+0x2ded]        # 3f98 <getrandom@plt+0x2d88>
    11ab:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

00000000000011b0 <read@plt>:
    11b0:	f3 0f 1e fa          	endbr64
    11b4:	f2 ff 25 e5 2d 00 00 	bnd jmp QWORD PTR [rip+0x2de5]        # 3fa0 <getrandom@plt+0x2d90>
    11bb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

00000000000011c0 <memcpy@plt>:
    11c0:	f3 0f 1e fa          	endbr64
    11c4:	f2 ff 25 dd 2d 00 00 	bnd jmp QWORD PTR [rip+0x2ddd]        # 3fa8 <getrandom@plt+0x2d98>
    11cb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

00000000000011d0 <malloc@plt>:
    11d0:	f3 0f 1e fa          	endbr64
    11d4:	f2 ff 25 d5 2d 00 00 	bnd jmp QWORD PTR [rip+0x2dd5]        # 3fb0 <getrandom@plt+0x2da0>
    11db:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

00000000000011e0 <open@plt>:
    11e0:	f3 0f 1e fa          	endbr64
    11e4:	f2 ff 25 cd 2d 00 00 	bnd jmp QWORD PTR [rip+0x2dcd]        # 3fb8 <getrandom@plt+0x2da8>
    11eb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

00000000000011f0 <perror@plt>:
    11f0:	f3 0f 1e fa          	endbr64
    11f4:	f2 ff 25 c5 2d 00 00 	bnd jmp QWORD PTR [rip+0x2dc5]        # 3fc0 <getrandom@plt+0x2db0>
    11fb:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001200 <exit@plt>:
    1200:	f3 0f 1e fa          	endbr64
    1204:	f2 ff 25 bd 2d 00 00 	bnd jmp QWORD PTR [rip+0x2dbd]        # 3fc8 <getrandom@plt+0x2db8>
    120b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

0000000000001210 <getrandom@plt>:
    1210:	f3 0f 1e fa          	endbr64
    1214:	f2 ff 25 b5 2d 00 00 	bnd jmp QWORD PTR [rip+0x2db5]        # 3fd0 <getrandom@plt+0x2dc0>
    121b:	0f 1f 44 00 00       	nop    DWORD PTR [rax+rax*1+0x0]

Disassembly of section .text:

0000000000001220 <.text>:
    1220:	f3 0f 1e fa          	endbr64
    1224:	31 ed                	xor    ebp,ebp
    1226:	49 89 d1             	mov    r9,rdx
    1229:	5e                   	pop    rsi
    122a:	48 89 e2             	mov    rdx,rsp
    122d:	48 83 e4 f0          	and    rsp,0xfffffffffffffff0
    1231:	50                   	push   rax
    1232:	54                   	push   rsp
    1233:	45 31 c0             	xor    r8d,r8d
    1236:	31 c9                	xor    ecx,ecx
    1238:	48 8d 3d a2 06 00 00 	lea    rdi,[rip+0x6a2]        # 18e1 <getrandom@plt+0x6d1>
    123f:	ff 15 93 2d 00 00    	call   QWORD PTR [rip+0x2d93]        # 3fd8 <getrandom@plt+0x2dc8>
    1245:	f4                   	hlt
    1246:	66 2e 0f 1f 84 00 00 00 00 00 	nop    WORD PTR cs:[rax+rax*1+0x0]
    1250:	48 8d 3d e9 2d 00 00 	lea    rdi,[rip+0x2de9]        # 4040 <getrandom@plt+0x2e30>
    1257:	48 8d 05 e2 2d 00 00 	lea    rax,[rip+0x2de2]        # 4040 <getrandom@plt+0x2e30>
    125e:	48 39 f8             	cmp    rax,rdi
    1261:	74 15                	je     1278 <getrandom@plt+0x68>
    1263:	48 8b 05 76 2d 00 00 	mov    rax,QWORD PTR [rip+0x2d76]        # 3fe0 <getrandom@plt+0x2dd0>
    126a:	48 85 c0             	test   rax,rax
    126d:	74 09                	je     1278 <getrandom@plt+0x68>
    126f:	ff e0                	jmp    rax
    1271:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
    1278:	c3                   	ret
    1279:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
    1280:	48 8d 3d b9 2d 00 00 	lea    rdi,[rip+0x2db9]        # 4040 <getrandom@plt+0x2e30>
    1287:	48 8d 35 b2 2d 00 00 	lea    rsi,[rip+0x2db2]        # 4040 <getrandom@plt+0x2e30>
    128e:	48 29 fe             	sub    rsi,rdi
    1291:	48 89 f0             	mov    rax,rsi
    1294:	48 c1 ee 3f          	shr    rsi,0x3f
    1298:	48 c1 f8 03          	sar    rax,0x3
    129c:	48 01 c6             	add    rsi,rax
    129f:	48 d1 fe             	sar    rsi,1
    12a2:	74 14                	je     12b8 <getrandom@plt+0xa8>
    12a4:	48 8b 05 45 2d 00 00 	mov    rax,QWORD PTR [rip+0x2d45]        # 3ff0 <getrandom@plt+0x2de0>
    12ab:	48 85 c0             	test   rax,rax
    12ae:	74 08                	je     12b8 <getrandom@plt+0xa8>
    12b0:	ff e0                	jmp    rax
    12b2:	66 0f 1f 44 00 00    	nop    WORD PTR [rax+rax*1+0x0]
    12b8:	c3                   	ret
    12b9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
    12c0:	f3 0f 1e fa          	endbr64
    12c4:	80 3d 75 2d 00 00 00 	cmp    BYTE PTR [rip+0x2d75],0x0        # 4040 <getrandom@plt+0x2e30>
    12cb:	75 2b                	jne    12f8 <getrandom@plt+0xe8>
    12cd:	55                   	push   rbp
    12ce:	48 83 3d 22 2d 00 00 00 	cmp    QWORD PTR [rip+0x2d22],0x0        # 3ff8 <getrandom@plt+0x2de8>
    12d6:	48 89 e5             	mov    rbp,rsp
    12d9:	74 0c                	je     12e7 <getrandom@plt+0xd7>
    12db:	48 8b 3d 26 2d 00 00 	mov    rdi,QWORD PTR [rip+0x2d26]        # 4008 <getrandom@plt+0x2df8>
    12e2:	e8 39 fe ff ff       	call   1120 <__cxa_finalize@plt>
    12e7:	e8 64 ff ff ff       	call   1250 <getrandom@plt+0x40>
    12ec:	c6 05 4d 2d 00 00 01 	mov    BYTE PTR [rip+0x2d4d],0x1        # 4040 <getrandom@plt+0x2e30>
    12f3:	5d                   	pop    rbp
    12f4:	c3                   	ret
    12f5:	0f 1f 00             	nop    DWORD PTR [rax]
    12f8:	c3                   	ret
    12f9:	0f 1f 80 00 00 00 00 	nop    DWORD PTR [rax+0x0]
    1300:	f3 0f 1e fa          	endbr64
    1304:	e9 77 ff ff ff       	jmp    1280 <getrandom@plt+0x70>
    1309:	f3 0f 1e fa          	endbr64
    130d:	55                   	push   rbp
    130e:	48 89 e5             	mov    rbp,rsp
    1311:	48 83 ec 10          	sub    rsp,0x10
    1315:	64 48 8b 04 25 28 00 00 00 	mov    rax,QWORD PTR fs:0x28
    131e:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    1322:	31 c0                	xor    eax,eax
    1324:	48 8d 45 f0          	lea    rax,[rbp-0x10]
    1328:	ba 00 00 00 00       	mov    edx,0x0
    132d:	be 08 00 00 00       	mov    esi,0x8
    1332:	48 89 c7             	mov    rdi,rax
    1335:	e8 d6 fe ff ff       	call   1210 <getrandom@plt>
    133a:	48 83 f8 08          	cmp    rax,0x8
    133e:	74 19                	je     1359 <getrandom@plt+0x149>
    1340:	48 8d 05 c1 0c 00 00 	lea    rax,[rip+0xcc1]        # 2008 <getrandom@plt+0xdf8>
    1347:	48 89 c7             	mov    rdi,rax
    134a:	e8 f1 fd ff ff       	call   1140 <puts@plt>
    134f:	bf 01 00 00 00       	mov    edi,0x1
    1354:	e8 a7 fe ff ff       	call   1200 <exit@plt>
    1359:	48 8b 45 f0          	mov    rax,QWORD PTR [rbp-0x10]
    135d:	48 8b 55 f8          	mov    rdx,QWORD PTR [rbp-0x8]
    1361:	64 48 2b 14 25 28 00 00 00 	sub    rdx,QWORD PTR fs:0x28
    136a:	74 05                	je     1371 <getrandom@plt+0x161>
    136c:	e8 ef fd ff ff       	call   1160 <__stack_chk_fail@plt>
    1371:	c9                   	leave
    1372:	c3                   	ret
    1373:	f3 0f 1e fa          	endbr64
    1377:	55                   	push   rbp
    1378:	48 89 e5             	mov    rbp,rsp
    137b:	48 89 7d e8          	mov    QWORD PTR [rbp-0x18],rdi
    137f:	48 89 75 e0          	mov    QWORD PTR [rbp-0x20],rsi
    1383:	48 c7 45 f8 00 00 00 00 	mov    QWORD PTR [rbp-0x8],0x0
    138b:	c7 45 f4 00 00 00 00 	mov    DWORD PTR [rbp-0xc],0x0
    1392:	e9 9b 00 00 00       	jmp    1432 <getrandom@plt+0x222>
    1397:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]  ;           a = *(rbp-0x8)
    139b:	48 8d 0c 00          	lea    rcx,[rax+rax*1]          ; c = 2 * result
    139f:	ba b3 23 00 00       	mov    edx,0x23b3               ;           d = 0x23b3 (u32)
    13a4:	48 89 c8             	mov    rax,rcx                  ;           a = c
    13a7:	48 f7 e2             	mul    rdx                      ; d = result * 0x23b3 * 2 >> 64          d, _ = c * 0x23b3 (unsigned)
    13aa:	48 89 c8             	mov    rax,rcx                  ;           a = c
    13ad:	48 29 d0             	sub    rax,rdx                  ;           a = c - (result * 0x23b3 * 2 >> 64)
    13b0:	48 d1 e8             	shr    rax,1                    ;           a /= 2 (sign bit copied)
    13b3:	48 01 d0             	add    rax,rdx                  ; a = (c - d) / 2 + d = 0.5c - 0.5d + d = (result + d) / 2
    13b6:	48 c1 e8 3e          	shr    rax,0x3e                 ; a >>= 62
    13ba:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax  ;           result = a
    13be:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]  ;           a = *(rbp-0x8)
    13c2:	48 ba 27 ee ff ff ff ff ff 7f 	movabs rdx,0x7fffffffffffee27 ; d = 0x7fffffffffffee27
    13cc:	48 0f af d0          	imul   rdx,rax                  ; d *= a (signed)
    13d0:	48 89 c8             	mov    rax,rcx                  ; a = c
    13d3:	48 29 d0             	sub    rax,rdx                  ; a -= d
    13d6:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax  ; result = 2 * result - 0x7fffffffffffee27 * result
    13da:	48 8b 45 e0          	mov    rax,QWORD PTR [rbp-0x20] ; a = timer *(rbp-0x20)
    13de:	48 85 c0             	test   rax,rax                  ; (same as cmp apparently)
    13e1:	79 47                	jns    142a <getrandom@plt+0x21a> ; skip if positive, i.e., IF timer < 0:
    13e3:	48 8b 55 f8          	mov    rdx,QWORD PTR [rbp-0x8]  ; d = *(rbp-0x8)
    13e7:	48 8b 45 e8          	mov    rax,QWORD PTR [rbp-0x18] ; a = *(rbp-0x18)
    13eb:	48 8d 0c 02          	lea    rcx,[rdx+rax*1]          ; c = a + d
    13ef:	ba b3 23 00 00       	mov    edx,0x23b3               ; d = 0x23b3 (u32)
    13f4:	48 89 c8             	mov    rax,rcx                  ; a = c
    13f7:	48 f7 e2             	mul    rdx                      ; d, a *= a * d
    13fa:	48 89 c8             	mov    rax,rcx                  ; a = c
    13fd:	48 29 d0             	sub    rax,rdx                  ; a -= d
    1400:	48 d1 e8             	shr    rax,1                    ; a >>= 1
    1403:	48 01 d0             	add    rax,rdx                  ; a += d
    1406:	48 c1 e8 3e          	shr    rax,0x3e                 ; a >>= 0x3e
    140a:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax  ; *(rbp-0x8) = a
    140e:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]  ; a = *(rbp-0x8)
    1412:	48 ba 27 ee ff ff ff ff ff 7f 	movabs rdx,0x7fffffffffffee27 ; d = 0x7fffffffffffee27
    141c:	48 0f af d0          	imul   rdx,rax                  ; d *= a (signed)
    1420:	48 89 c8             	mov    rax,rcx                  ; a = c
    1423:	48 29 d0             	sub    rax,rdx                  ; a -= d
    1426:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax  ; *(rbp-0x8) = a
    142a:	48 d1 65 e0          	shl    QWORD PTR [rbp-0x20],1   ; END IF. *(rbp-0x20) <<= 1
    142e:	83 45 f4 01          	add    DWORD PTR [rbp-0xc],0x1
    1432:	83 7d f4 3f          	cmp    DWORD PTR [rbp-0xc],0x3f
    1436:	0f 8e 5b ff ff ff    	jle    1397 <getrandom@plt+0x187>
    143c:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]
    1440:	5d                   	pop    rbp
    1441:	c3                   	ret
    1442:	f3 0f 1e fa          	endbr64
    1446:	55                   	push   rbp
    1447:	48 89 e5             	mov    rbp,rsp
    144a:	48 83 ec 48          	sub    rsp,0x48
    144e:	48 89 7d b8          	mov    QWORD PTR [rbp-0x48],rdi
    1452:	48 c7 45 c8 00 00 00 00 	mov    QWORD PTR [rbp-0x38],0x0
    145a:	48 b8 27 ee ff ff ff ff ff 7f 	movabs rax,0x7fffffffffffee27
    1464:	48 89 45 d0          	mov    QWORD PTR [rbp-0x30],rax
    1468:	48 c7 45 d8 01 00 00 00 	mov    QWORD PTR [rbp-0x28],0x1
    1470:	48 8b 45 b8          	mov    rax,QWORD PTR [rbp-0x48]
    1474:	48 89 45 e0          	mov    QWORD PTR [rbp-0x20],rax
    1478:	e9 a5 00 00 00       	jmp    1522 <getrandom@plt+0x312>
    147d:	48 8b 45 d0          	mov    rax,QWORD PTR [rbp-0x30]
    1481:	ba 00 00 00 00       	mov    edx,0x0
    1486:	48 f7 75 e0          	div    QWORD PTR [rbp-0x20]
    148a:	48 89 45 e8          	mov    QWORD PTR [rbp-0x18],rax
    148e:	48 8b 45 d0          	mov    rax,QWORD PTR [rbp-0x30]
    1492:	ba 00 00 00 00       	mov    edx,0x0
    1497:	48 f7 75 e0          	div    QWORD PTR [rbp-0x20]
    149b:	48 89 55 f0          	mov    QWORD PTR [rbp-0x10],rdx
    149f:	48 8b 45 d8          	mov    rax,QWORD PTR [rbp-0x28]
    14a3:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    14a7:	48 b8 27 ee ff ff ff ff ff 7f 	movabs rax,0x7fffffffffffee27
    14b1:	48 2b 45 d8          	sub    rax,QWORD PTR [rbp-0x28]
    14b5:	48 89 c2             	mov    rdx,rax
    14b8:	48 8b 45 e8          	mov    rax,QWORD PTR [rbp-0x18]
    14bc:	48 89 d6             	mov    rsi,rdx
    14bf:	48 89 c7             	mov    rdi,rax
    14c2:	e8 ac fe ff ff       	call   1373 <getrandom@plt+0x163>
    14c7:	48 8b 55 c8          	mov    rdx,QWORD PTR [rbp-0x38]
    14cb:	48 8d 0c 10          	lea    rcx,[rax+rdx*1]
    14cf:	ba b3 23 00 00       	mov    edx,0x23b3
    14d4:	48 89 c8             	mov    rax,rcx
    14d7:	48 f7 e2             	mul    rdx
    14da:	48 89 c8             	mov    rax,rcx
    14dd:	48 29 d0             	sub    rax,rdx
    14e0:	48 d1 e8             	shr    rax,1
    14e3:	48 01 d0             	add    rax,rdx
    14e6:	48 c1 e8 3e          	shr    rax,0x3e
    14ea:	48 89 45 d8          	mov    QWORD PTR [rbp-0x28],rax
    14ee:	48 8b 45 d8          	mov    rax,QWORD PTR [rbp-0x28]
    14f2:	48 ba 27 ee ff ff ff ff ff 7f 	movabs rdx,0x7fffffffffffee27
    14fc:	48 0f af d0          	imul   rdx,rax
    1500:	48 89 c8             	mov    rax,rcx
    1503:	48 29 d0             	sub    rax,rdx
    1506:	48 89 45 d8          	mov    QWORD PTR [rbp-0x28],rax
    150a:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]
    150e:	48 89 45 c8          	mov    QWORD PTR [rbp-0x38],rax
    1512:	48 8b 45 e0          	mov    rax,QWORD PTR [rbp-0x20]
    1516:	48 89 45 d0          	mov    QWORD PTR [rbp-0x30],rax
    151a:	48 8b 45 f0          	mov    rax,QWORD PTR [rbp-0x10]
    151e:	48 89 45 e0          	mov    QWORD PTR [rbp-0x20],rax
    1522:	48 83 7d e0 00       	cmp    QWORD PTR [rbp-0x20],0x0
    1527:	0f 85 50 ff ff ff    	jne    147d <getrandom@plt+0x26d>
    152d:	48 8b 45 c8          	mov    rax,QWORD PTR [rbp-0x38]
    1531:	c9                   	leave
    1532:	c3                   	ret
    1533:	f3 0f 1e fa          	endbr64
    1537:	55                   	push   rbp
    1538:	48 89 e5             	mov    rbp,rsp
    153b:	48 83 ec 20          	sub    rsp,0x20
    153f:	89 7d ec             	mov    DWORD PTR [rbp-0x14],edi
    1542:	8b 45 ec             	mov    eax,DWORD PTR [rbp-0x14]
    1545:	ba 02 00 00 00       	mov    edx,0x2
    154a:	be 00 00 00 00       	mov    esi,0x0
    154f:	89 c7                	mov    edi,eax
    1551:	e8 3a fc ff ff       	call   1190 <lseek@plt>
    1556:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    155a:	48 83 7d f8 ff       	cmp    QWORD PTR [rbp-0x8],0xffffffffffffffff
    155f:	75 19                	jne    157a <getrandom@plt+0x36a>
    1561:	48 8d 05 b4 0a 00 00 	lea    rax,[rip+0xab4]        # 201c <getrandom@plt+0xe0c>
    1568:	48 89 c7             	mov    rdi,rax
    156b:	e8 80 fc ff ff       	call   11f0 <perror@plt>
    1570:	bf 01 00 00 00       	mov    edi,0x1
    1575:	e8 86 fc ff ff       	call   1200 <exit@plt>
    157a:	8b 45 ec             	mov    eax,DWORD PTR [rbp-0x14]
    157d:	ba 00 00 00 00       	mov    edx,0x0
    1582:	be 00 00 00 00       	mov    esi,0x0
    1587:	89 c7                	mov    edi,eax
    1589:	e8 02 fc ff ff       	call   1190 <lseek@plt>
    158e:	48 83 f8 ff          	cmp    rax,0xffffffffffffffff
    1592:	75 19                	jne    15ad <getrandom@plt+0x39d>
    1594:	48 8d 05 9c 0a 00 00 	lea    rax,[rip+0xa9c]        # 2037 <getrandom@plt+0xe27>
    159b:	48 89 c7             	mov    rdi,rax
    159e:	e8 4d fc ff ff       	call   11f0 <perror@plt>
    15a3:	bf 01 00 00 00       	mov    edi,0x1
    15a8:	e8 53 fc ff ff       	call   1200 <exit@plt>
    15ad:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]
    15b1:	c9                   	leave
    15b2:	c3                   	ret
    15b3:	f3 0f 1e fa          	endbr64
    15b7:	55                   	push   rbp
    15b8:	48 89 e5             	mov    rbp,rsp
    15bb:	48 83 ec 40          	sub    rsp,0x40
    15bf:	48 89 7d d8          	mov    QWORD PTR [rbp-0x28],rdi
    15c3:	48 89 75 d0          	mov    QWORD PTR [rbp-0x30],rsi
    15c7:	48 89 55 c8          	mov    QWORD PTR [rbp-0x38],rdx
    15cb:	48 8b 45 d8          	mov    rax,QWORD PTR [rbp-0x28]
    15cf:	48 89 45 f0          	mov    QWORD PTR [rbp-0x10],rax
    15d3:	48 8b 45 d0          	mov    rax,QWORD PTR [rbp-0x30]
    15d7:	48 8d 50 f8          	lea    rdx,[rax-0x8]
    15db:	48 8b 45 d8          	mov    rax,QWORD PTR [rbp-0x28]
    15df:	48 01 d0             	add    rax,rdx
    15e2:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    15e6:	c7 45 ec 00 00 00 00 	mov    DWORD PTR [rbp-0x14],0x0
    15ed:	eb 21                	jmp    1610 <getrandom@plt+0x400>
    15ef:	48 8b 45 f0          	mov    rax,QWORD PTR [rbp-0x10]
    15f3:	48 8b 10             	mov    rdx,QWORD PTR [rax]
    15f6:	48 8b 45 c8          	mov    rax,QWORD PTR [rbp-0x38]
    15fa:	48 8b 00             	mov    rax,QWORD PTR [rax]
    15fd:	48 39 c2             	cmp    rdx,rax
    1600:	75 09                	jne    160b <getrandom@plt+0x3fb>
    1602:	c7 45 ec 01 00 00 00 	mov    DWORD PTR [rbp-0x14],0x1
    1609:	eb 0f                	jmp    161a <getrandom@plt+0x40a>
    160b:	48 83 45 f0 08       	add    QWORD PTR [rbp-0x10],0x8
    1610:	48 8b 45 f0          	mov    rax,QWORD PTR [rbp-0x10]
    1614:	48 3b 45 f8          	cmp    rax,QWORD PTR [rbp-0x8]
    1618:	76 d5                	jbe    15ef <getrandom@plt+0x3df>
    161a:	83 7d ec 00          	cmp    DWORD PTR [rbp-0x14],0x0
    161e:	75 0a                	jne    162a <getrandom@plt+0x41a>
    1620:	bf 02 00 00 00       	mov    edi,0x2
    1625:	e8 d6 fb ff ff       	call   1200 <exit@plt>
    162a:	48 8b 4d c8          	mov    rcx,QWORD PTR [rbp-0x38]
    162e:	48 8b 45 f0          	mov    rax,QWORD PTR [rbp-0x10]
    1632:	ba 20 00 00 00       	mov    edx,0x20
    1637:	48 89 ce             	mov    rsi,rcx
    163a:	48 89 c7             	mov    rdi,rax
    163d:	e8 7e fb ff ff       	call   11c0 <memcpy@plt>
    1642:	90                   	nop
    1643:	c9                   	leave
    1644:	c3                   	ret
    1645:	f3 0f 1e fa          	endbr64
    1649:	55                   	push   rbp
    164a:	48 89 e5             	mov    rbp,rsp
    164d:	48 83 ec 60          	sub    rsp,0x60
    1651:	48 89 7d a8          	mov    QWORD PTR [rbp-0x58],rdi
    1655:	64 48 8b 04 25 28 00 00 00 	mov    rax,QWORD PTR fs:0x28
    165e:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    1662:	31 c0                	xor    eax,eax
    1664:	be 00 00 00 00       	mov    esi,0x0
    1669:	48 8d 05 d5 09 00 00 	lea    rax,[rip+0x9d5]        # 2045 <getrandom@plt+0xe35>
    1670:	48 89 c7             	mov    rdi,rax
    1673:	b8 00 00 00 00       	mov    eax,0x0
    1678:	e8 63 fb ff ff       	call   11e0 <open@plt>
    167d:	89 45 b0             	mov    DWORD PTR [rbp-0x50],eax
    1680:	83 7d b0 ff          	cmp    DWORD PTR [rbp-0x50],0xffffffff
    1684:	75 19                	jne    169f <getrandom@plt+0x48f>
    1686:	48 8d 05 c7 09 00 00 	lea    rax,[rip+0x9c7]        # 2054 <getrandom@plt+0xe44>
    168d:	48 89 c7             	mov    rdi,rax
    1690:	e8 5b fb ff ff       	call   11f0 <perror@plt>
    1695:	bf 01 00 00 00       	mov    edi,0x1
    169a:	e8 61 fb ff ff       	call   1200 <exit@plt>
    169f:	8b 45 b0             	mov    eax,DWORD PTR [rbp-0x50]
    16a2:	89 c7                	mov    edi,eax
    16a4:	e8 8a fe ff ff       	call   1533 <getrandom@plt+0x323>
    16a9:	48 89 45 b8          	mov    QWORD PTR [rbp-0x48],rax
    16ad:	48 b8 64 6f 6c 6c 2d 00 00 00 	movabs rax,0x2d6c6c6f64
    16b7:	ba 00 00 00 00       	mov    edx,0x0
    16bc:	48 89 45 d0          	mov    QWORD PTR [rbp-0x30],rax
    16c0:	48 89 55 d8          	mov    QWORD PTR [rbp-0x28],rdx
    16c4:	48 c7 45 e0 00 00 00 00 	mov    QWORD PTR [rbp-0x20],0x0
    16cc:	66 c7 45 e8 00 00    	mov    WORD PTR [rbp-0x18],0x0
    16d2:	48 8b 45 a8          	mov    rax,QWORD PTR [rbp-0x58]
    16d6:	48 8b 50 18          	mov    rdx,QWORD PTR [rax+0x18]
    16da:	48 8d 45 d0          	lea    rax,[rbp-0x30]
    16de:	48 83 c0 05          	add    rax,0x5
    16e2:	48 89 d1             	mov    rcx,rdx
    16e5:	48 8d 15 7e 09 00 00 	lea    rdx,[rip+0x97e]        # 206a <getrandom@plt+0xe5a>
    16ec:	be 15 00 00 00       	mov    esi,0x15
    16f1:	48 89 c7             	mov    rdi,rax
    16f4:	b8 00 00 00 00       	mov    eax,0x0
    16f9:	e8 82 fa ff ff       	call   1180 <snprintf@plt>
    16fe:	48 8d 45 d0          	lea    rax,[rbp-0x30]
    1702:	ba c0 01 00 00       	mov    edx,0x1c0
    1707:	be c1 00 00 00       	mov    esi,0xc1
    170c:	48 89 c7             	mov    rdi,rax
    170f:	b8 00 00 00 00       	mov    eax,0x0
    1714:	e8 c7 fa ff ff       	call   11e0 <open@plt>
    1719:	89 45 b4             	mov    DWORD PTR [rbp-0x4c],eax
    171c:	83 7d b4 ff          	cmp    DWORD PTR [rbp-0x4c],0xffffffff
    1720:	75 19                	jne    173b <getrandom@plt+0x52b>
    1722:	48 8d 05 46 09 00 00 	lea    rax,[rip+0x946]        # 206f <getrandom@plt+0xe5f>
    1729:	48 89 c7             	mov    rdi,rax
    172c:	e8 bf fa ff ff       	call   11f0 <perror@plt>
    1731:	bf 01 00 00 00       	mov    edi,0x1
    1736:	e8 c5 fa ff ff       	call   1200 <exit@plt>
    173b:	48 8b 45 b8          	mov    rax,QWORD PTR [rbp-0x48]
    173f:	48 89 c7             	mov    rdi,rax
    1742:	e8 89 fa ff ff       	call   11d0 <malloc@plt>
    1747:	48 89 45 c0          	mov    QWORD PTR [rbp-0x40],rax
    174b:	48 83 7d c0 00       	cmp    QWORD PTR [rbp-0x40],0x0
    1750:	75 19                	jne    176b <getrandom@plt+0x55b>
    1752:	48 8d 05 30 09 00 00 	lea    rax,[rip+0x930]        # 2089 <getrandom@plt+0xe79>
    1759:	48 89 c7             	mov    rdi,rax
    175c:	e8 df f9 ff ff       	call   1140 <puts@plt>
    1761:	bf 01 00 00 00       	mov    edi,0x1
    1766:	e8 95 fa ff ff       	call   1200 <exit@plt>
    176b:	48 8b 55 b8          	mov    rdx,QWORD PTR [rbp-0x48]
    176f:	48 8b 4d c0          	mov    rcx,QWORD PTR [rbp-0x40]
    1773:	8b 45 b0             	mov    eax,DWORD PTR [rbp-0x50]
    1776:	48 89 ce             	mov    rsi,rcx
    1779:	89 c7                	mov    edi,eax
    177b:	e8 30 fa ff ff       	call   11b0 <read@plt>
    1780:	48 89 45 c8          	mov    QWORD PTR [rbp-0x38],rax
    1784:	48 83 7d c8 00       	cmp    QWORD PTR [rbp-0x38],0x0
    1789:	7e 0a                	jle    1795 <getrandom@plt+0x585>
    178b:	48 8b 45 b8          	mov    rax,QWORD PTR [rbp-0x48]
    178f:	48 39 45 c8          	cmp    QWORD PTR [rbp-0x38],rax
    1793:	74 19                	je     17ae <getrandom@plt+0x59e>
    1795:	48 8d 05 04 09 00 00 	lea    rax,[rip+0x904]        # 20a0 <getrandom@plt+0xe90>
    179c:	48 89 c7             	mov    rdi,rax
    179f:	e8 9c f9 ff ff       	call   1140 <puts@plt>
    17a4:	bf 01 00 00 00       	mov    edi,0x1
    17a9:	e8 52 fa ff ff       	call   1200 <exit@plt>
    17ae:	48 8b 55 a8          	mov    rdx,QWORD PTR [rbp-0x58]
    17b2:	48 8b 4d b8          	mov    rcx,QWORD PTR [rbp-0x48]
    17b6:	48 8b 45 c0          	mov    rax,QWORD PTR [rbp-0x40]
    17ba:	48 89 ce             	mov    rsi,rcx
    17bd:	48 89 c7             	mov    rdi,rax
    17c0:	e8 ee fd ff ff       	call   15b3 <getrandom@plt+0x3a3>
    17c5:	48 8b 55 b8          	mov    rdx,QWORD PTR [rbp-0x48]
    17c9:	48 8b 4d c0          	mov    rcx,QWORD PTR [rbp-0x40]
    17cd:	8b 45 b4             	mov    eax,DWORD PTR [rbp-0x4c]
    17d0:	48 89 ce             	mov    rsi,rcx
    17d3:	89 c7                	mov    edi,eax
    17d5:	e8 76 f9 ff ff       	call   1150 <write@plt>
    17da:	48 83 f8 ff          	cmp    rax,0xffffffffffffffff
    17de:	75 19                	jne    17f9 <getrandom@plt+0x5e9>
    17e0:	48 8d 05 e4 08 00 00 	lea    rax,[rip+0x8e4]        # 20cb <getrandom@plt+0xebb>
    17e7:	48 89 c7             	mov    rdi,rax
    17ea:	e8 01 fa ff ff       	call   11f0 <perror@plt>
    17ef:	bf 01 00 00 00       	mov    edi,0x1
    17f4:	e8 07 fa ff ff       	call   1200 <exit@plt>
    17f9:	48 8b 45 c0          	mov    rax,QWORD PTR [rbp-0x40]
    17fd:	48 89 c7             	mov    rdi,rax
    1800:	e8 2b f9 ff ff       	call   1130 <free@plt>
    1805:	8b 45 b4             	mov    eax,DWORD PTR [rbp-0x4c]
    1808:	89 c7                	mov    edi,eax
    180a:	e8 91 f9 ff ff       	call   11a0 <close@plt>
    180f:	8b 45 b0             	mov    eax,DWORD PTR [rbp-0x50]
    1812:	89 c7                	mov    edi,eax
    1814:	e8 87 f9 ff ff       	call   11a0 <close@plt>
    1819:	90                   	nop
    181a:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]
    181e:	64 48 2b 04 25 28 00 00 00 	sub    rax,QWORD PTR fs:0x28
    1827:	74 05                	je     182e <getrandom@plt+0x61e>
    1829:	e8 32 f9 ff ff       	call   1160 <__stack_chk_fail@plt>
    182e:	c9                   	leave
    182f:	c3                   	ret
    1830:	f3 0f 1e fa          	endbr64
    1834:	55                   	push   rbp
    1835:	48 89 e5             	mov    rbp,rsp
    1838:	48 83 ec 30          	sub    rsp,0x30
    183c:	64 48 8b 04 25 28 00 00 00 	mov    rax,QWORD PTR fs:0x28
    1845:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    1849:	31 c0                	xor    eax,eax
    184b:	48 8b 05 de 27 00 00 	mov    rax,QWORD PTR [rip+0x27de]        # 4030 <getrandom@plt+0x2e20>
    1852:	48 89 c7             	mov    rdi,rax
    1855:	e8 e8 fb ff ff       	call   1442 <getrandom@plt+0x232>
    185a:	48 89 c2             	mov    rdx,rax
    185d:	48 8b 05 c4 27 00 00 	mov    rax,QWORD PTR [rip+0x27c4]        # 4028 <getrandom@plt+0x2e18>
    1864:	48 89 d6             	mov    rsi,rdx
    1867:	48 89 c7             	mov    rdi,rax
    186a:	e8 04 fb ff ff       	call   1373 <getrandom@plt+0x163>
    186f:	48 89 45 e0          	mov    QWORD PTR [rbp-0x20],rax
    1873:	48 8b 45 e0          	mov    rax,QWORD PTR [rbp-0x20]
    1877:	48 89 c6             	mov    rsi,rax
    187a:	48 b8 f2 73 fb 5b 66 be 88 08 	movabs rax,0x888be665bfb73f2
    1884:	48 89 c7             	mov    rdi,rax
    1887:	e8 e7 fa ff ff       	call   1373 <getrandom@plt+0x163>
    188c:	48 89 45 d8          	mov    QWORD PTR [rbp-0x28],rax
    1890:	48 8b 45 d8          	mov    rax,QWORD PTR [rbp-0x28]
    1894:	48 89 45 ef          	mov    QWORD PTR [rbp-0x11],rax
    1898:	c6 45 f7 00          	mov    BYTE PTR [rbp-0x9],0x0
    189c:	48 8d 05 3b 08 00 00 	lea    rax,[rip+0x83b]        # 20de <getrandom@plt+0xece>
    18a3:	48 89 c7             	mov    rdi,rax
    18a6:	e8 95 f8 ff ff       	call   1140 <puts@plt>
    18ab:	48 8b 55 e0          	mov    rdx,QWORD PTR [rbp-0x20]
    18af:	48 8d 45 ef          	lea    rax,[rbp-0x11]
    18b3:	48 89 c6             	mov    rsi,rax
    18b6:	48 8d 05 3f 08 00 00 	lea    rax,[rip+0x83f]        # 20fc <getrandom@plt+0xeec>
    18bd:	48 89 c7             	mov    rdi,rax
    18c0:	b8 00 00 00 00       	mov    eax,0x0
    18c5:	e8 a6 f8 ff ff       	call   1170 <printf@plt>
    18ca:	90                   	nop
    18cb:	48 8b 45 f8          	mov    rax,QWORD PTR [rbp-0x8]
    18cf:	64 48 2b 04 25 28 00 00 00 	sub    rax,QWORD PTR fs:0x28
    18d8:	74 05                	je     18df <getrandom@plt+0x6cf>
    18da:	e8 81 f8 ff ff       	call   1160 <__stack_chk_fail@plt>
    18df:	c9                   	leave
    18e0:	c3                   	ret
    18e1:	f3 0f 1e fa          	endbr64
    18e5:	55                   	push   rbp
    18e6:	48 89 e5             	mov    rbp,rsp
    18e9:	48 83 ec 40          	sub    rsp,0x40
    18ed:	64 48 8b 04 25 28 00 00 00 	mov    rax,QWORD PTR fs:0x28
    18f6:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    18fa:	31 c0                	xor    eax,eax
    18fc:	48 8b 05 35 27 00 00 	mov    rax,QWORD PTR [rip+0x2735]        # 4038 <getrandom@plt+0x2e28>
    1903:	48 ba a2 79 38 1b 8d e9 b8 73 	movabs rdx,0x73b8e98d1b3879a2
    190d:	48 39 d0             	cmp    rax,rdx
    1910:	75 0f                	jne    1921 <getrandom@plt+0x711>
    1912:	e8 19 ff ff ff       	call   1830 <getrandom@plt+0x620>
    1917:	b8 00 00 00 00       	mov    eax,0x0
    191c:	e9 b5 00 00 00       	jmp    19d6 <getrandom@plt+0x7c6>
    1921:	48 8b 05 10 27 00 00 	mov    rax,QWORD PTR [rip+0x2710]        # 4038 <getrandom@plt+0x2e28>
    1928:	48 83 c0 01          	add    rax,0x1
    192c:	48 89 c6             	mov    rsi,rax
    192f:	48 8d 05 d6 07 00 00 	lea    rax,[rip+0x7d6]        # 210c <getrandom@plt+0xefc>
    1936:	48 89 c7             	mov    rdi,rax
    1939:	b8 00 00 00 00       	mov    eax,0x0
    193e:	e8 2d f8 ff ff       	call   1170 <printf@plt>
    1943:	48 8b 05 d6 26 00 00 	mov    rax,QWORD PTR [rip+0x26d6]        # 4020 <getrandom@plt+0x2e10>
    194a:	48 8b 15 d7 26 00 00 	mov    rdx,QWORD PTR [rip+0x26d7]        # 4028 <getrandom@plt+0x2e18>
    1951:	48 89 45 d0          	mov    QWORD PTR [rbp-0x30],rax
    1955:	48 89 55 d8          	mov    QWORD PTR [rbp-0x28],rdx
    1959:	48 8b 05 d0 26 00 00 	mov    rax,QWORD PTR [rip+0x26d0]        # 4030 <getrandom@plt+0x2e20>
    1960:	48 8b 15 d1 26 00 00 	mov    rdx,QWORD PTR [rip+0x26d1]        # 4038 <getrandom@plt+0x2e28>
    1967:	48 89 45 e0          	mov    QWORD PTR [rbp-0x20],rax
    196b:	48 89 55 e8          	mov    QWORD PTR [rbp-0x18],rdx
    196f:	e8 95 f9 ff ff       	call   1309 <getrandom@plt+0xf9>
    1974:	48 89 45 c8          	mov    QWORD PTR [rbp-0x38],rax
    1978:	48 8b 05 b1 26 00 00 	mov    rax,QWORD PTR [rip+0x26b1]        # 4030 <getrandom@plt+0x2e20>
    197f:	48 8b 55 c8          	mov    rdx,QWORD PTR [rbp-0x38]
    1983:	48 89 d6             	mov    rsi,rdx
    1986:	48 89 c7             	mov    rdi,rax
    1989:	e8 e5 f9 ff ff       	call   1373 <getrandom@plt+0x163>
    198e:	48 89 45 e0          	mov    QWORD PTR [rbp-0x20],rax
    1992:	48 8b 45 d8          	mov    rax,QWORD PTR [rbp-0x28]
    1996:	be 0b 00 00 00       	mov    esi,0xb
    199b:	48 89 c7             	mov    rdi,rax
    199e:	e8 d0 f9 ff ff       	call   1373 <getrandom@plt+0x163>
    19a3:	48 89 c2             	mov    rdx,rax
    19a6:	48 8b 45 c8          	mov    rax,QWORD PTR [rbp-0x38]
    19aa:	48 89 c6             	mov    rsi,rax
    19ad:	48 89 d7             	mov    rdi,rdx
    19b0:	e8 be f9 ff ff       	call   1373 <getrandom@plt+0x163>
    19b5:	48 89 45 d8          	mov    QWORD PTR [rbp-0x28],rax
    19b9:	48 8b 45 e8          	mov    rax,QWORD PTR [rbp-0x18]
    19bd:	48 83 c0 01          	add    rax,0x1
    19c1:	48 89 45 e8          	mov    QWORD PTR [rbp-0x18],rax
    19c5:	48 8d 45 d0          	lea    rax,[rbp-0x30]
    19c9:	48 89 c7             	mov    rdi,rax
    19cc:	e8 74 fc ff ff       	call   1645 <getrandom@plt+0x435>
    19d1:	b8 00 00 00 00       	mov    eax,0x0
    19d6:	48 8b 55 f8          	mov    rdx,QWORD PTR [rbp-0x8]
    19da:	64 48 2b 14 25 28 00 00 00 	sub    rdx,QWORD PTR fs:0x28
    19e3:	74 05                	je     19ea <getrandom@plt+0x7da>
    19e5:	e8 76 f7 ff ff       	call   1160 <__stack_chk_fail@plt>
    19ea:	c9                   	leave
    19eb:	c3                   	ret

Disassembly of section .fini:

00000000000019ec <.fini>:
    19ec:	f3 0f 1e fa          	endbr64
    19f0:	48 83 ec 08          	sub    rsp,0x8
    19f4:	48 83 c4 08          	add    rsp,0x8
    19f8:	c3                   	ret
