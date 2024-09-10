#include <stdio.h>

int main() {
	int a;
	printf("%s", (char *)(&a) + 1);
}
