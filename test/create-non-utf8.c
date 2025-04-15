#include <cstddef>
#include <cstdio>

int main() {
  const char file_name[] = {'\xff', '.', 'o', 'o', 'f', '\0'};
  // https://stackoverflow.com/a/11574035/28188730
  FILE *f = fopen(file_name, "w");
  if (f == NULL) {
    printf("Error opening file!\n");
    return 1;
  }

  /* print some text */
  const char *text = "Write this to the file";
  fprintf(f, "Some text: %s\n", text);

  /* print integers and floats */
  int i = 1;
  float pi = 3.1415927;
  fprintf(f, "Integer: %d, float: %f\n", i, pi);

  /* printing single characters */
  char c = 'A';
  fprintf(f, "A character: %c\n", c);

  fclose(f);

  const char file_name2[] = {'\xfe', '.', 'o', 'o', 'f', '\0'};
  FILE *f2 = fopen(file_name2, "w");
  if (f2 == NULL) {
    printf("Error opening file!\n");
    return 1;
  }
  fprintf(f2, "hello lol");
  fclose(f2);
}
