class TestExtension {

  constructor(runtimeProxy) {
    this.runtime = runtimeProxy;
  }

  getInfo() {
    return {
      id: 'testExt',
      name: 'test extension',
      menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',
      blocks: [
        {
          opcode: 'testReporter',

          // Required: the kind of block we're defining, from a predefined list:
          // 'command' - a normal command block, like "move {} steps"
          // 'reporter' - returns a value, like "direction"
          // 'Boolean' - same as 'reporter' but returns a Boolean value
          // 'hat' - starts a stack if its value is truthy
          // 'conditional' - control flow, like "if {}" or "if {} else {}"
          // A 'conditional' block may return the one-based index of a branch to
          // run, or it may return zero/falsy to run no branch.
          // 'loop' - control flow, like "repeat {} {}" or "forever {}"
          // A 'loop' block is like a conditional block with two differences:
          // - the block is assumed to have exactly one child branch, and
          // - each time a child branch finishes, the loop block is called again.
          blockType: 'reporter',
          
          text: 'hello my name is not [NAME]',
          arguments: {
            NAME: {
              type: 'string',
              default: 'Bob'
            }
          },
          func: 'testReporter'
        }
      ]
    }
  }

  testReporter(...otherStuff) {
    console.log(otherStuff);
    return new Date().toDateString();
  }

}

Scratch.extensions.register(new TestExtension());
