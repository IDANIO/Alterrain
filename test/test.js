const assert = require('assert');

let Command = require('../app/game/command');
let instance;

describe('Command', function() {
  describe('#constructor', function() {
    it('should construct with callback.', function() {
      instance = new Command(()=>{
        return 'Hello';
      });
      assert.equal(typeof instance.executeFn, 'function');
    });
  });
  describe('#execute', function() {
    it('should execute with no argument.', function() {
      let result = instance.execute();
      assert.equal(result, 'Hello');
    });
  });
});
