// scp monitor.c root@169.254.116.185:~
// gcc monitor.c -o monitor

// running /opt/redpitaya/bin/monitor crashes the program for some reason.. so
// im making my own

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

  if (argc == 2) {
    printf("%u\n", In32(adr, atoi(argv[1])));
  } else if (argc == 3) {
    Out32(adr, atoi(argv[1]), atoi(argv[2]));
  } else {
    printf("Usage: ./monitor <offset>\n");
    printf("Usage: ./monitor <offset> <value>\n");
  }
  return 0;
}
