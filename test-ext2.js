function TestExtension(runtimeProxy) {
  this.runtime = runtimeProxy;
  console.log(this);
}

TestExtension.prototype.getInfo = () => ({
  id: 'testExt',
  name: 'test extension',
  menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',
  blocks: [
    {
      opcode: 'testReporter',
      blockType: 'reporter',
      text: 'currentTime',
      arguments: {}
    },
    {
      opcode: 'testReporter2',
      blockType: 'reporter',
      text: 'currentDate',
      arguments: {}
    }
  ],
  colour: '#00BCD4',
  colourSecondary: '#00ACC1',
  colourTertiary: '#0097A7'
});

TestExtension.prototype.testReporter = (...otherStuff) => {
  console.log(otherStuff);
  console.log(this);
  return new Date().toTimeString();
}

TestExtension.prototype.testReporter2 = function(...otherStuff) {
  console.log(otherStuff);
  console.log(this);
  return new Date().toDateString();
}

Scratch.extensions.register(new TestExtension());
