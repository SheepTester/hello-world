int x = 0;
int y = 0;

void setup() {
  size(640, 360);
  noStroke();
}

void draw() { 
  background(#212121);
  
  fill(0xaa9C27B0);
  rect(x, y, 100, 100);
  rect(x + 50, y + 50, 100, 100);
}

void mouseClicked() {
  x = mouseX;
  y = mouseY;
}
