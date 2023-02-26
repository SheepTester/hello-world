// scp ~/site/hello-world/redpitaya_FPGA/samples.c root@IP:~
// gcc samples.c -o samples

#include <fcntl.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <unistd.h>

void Out32(void *adr, int offset, int value) {
  *((uint32_t *)(adr + offset)) = value;
}

unsigned int In32(void *adr, int offset) {
  return *((uint32_t *)(adr + offset));
}

unsigned int In16(void *adr, int offset) {
  unsigned int r;
  r = *((uint32_t *)(adr + offset));
  if (r > 32767)
    return r - 65536;
  return r;
}

int main(int argc, char **argv) {
  int fd;
  int BASE = 0x40300000; // Proc base address;
  void *adr;
  char *name = "/dev/mem";
  int i, d;

  /* open memory device */
  if ((fd = open(name, O_RDWR)) < 0) {
    perror("open");
    return 1;
  }

  /* map the memory, start from BASE address, size: _SC_PAGESIZE = 4k */
  adr = mmap(NULL, sysconf(_SC_PAGESIZE), PROT_READ | PROT_WRITE, MAP_SHARED,
             fd, BASE);

  /* ADD YOUR CODE HERE */

  /* enable scope, wait 1s and read & print samples */ /* SAMPLE CODE */
  Out32(adr, 0x50, 1);

  printf("index,sample\n");

  // Split the eight pointers into four blocks of 8 bytes
  int index = 0;
  int lastCount = In32(adr, 0x8c) & 0xff00;
  while (1) {
    for (int block = 0; block < 4; block++) {
      // Wait until cursor is out of the block
      while (1) {
        unsigned int cursor = In32(adr, 0x8c) & 0xff;
        if (!(cursor >= block * 8 && cursor < (block + 1) * 8)) {
          break;
        }
      }

      unsigned int a = In32(adr, 0x90 + block * 8);
      unsigned int b = In32(adr, 0x90 + block * 8 + 4);

      for (int i = 0; i < 8; i++) {
        printf("%d,%d\n", index, a & (1 << i) == 0 ? 0 : 1);
        index++;
      }
      for (int i = 0; i < 8; i++) {
        printf("%d,%d\n", index, b & (1 << i) == 0 ? 0 : 1);
        index++;
      }
    }
    int count = In32(adr, 0x8c) & 0xff00;
    printf("hi: %d, %d\n", lastCount, In32(adr, 0x8c) & 0xff00);
    printf("hi: %d, %d\n", lastCount, count);
    while ((In32(adr, 0x8c) & 0xff00) == lastCount) {
      printf("hmm: %d, %d\n", lastCount, In32(adr, 0x8c) & 0xff00);
    }
    printf("hi: %d, %d\n", lastCount, In32(adr, 0x8c) & 0xff00);
    break;
  }

  // sleep(1);
  // printf("x, y\n");
  // for (i = 0; i < 255; i++) {
  //   d = In16(adr, 0x60);
  //   printf("%d, %d\n", i, d);
  // }

  munmap(adr, sysconf(_SC_PAGESIZE));
  return 0;
}
