// import * as assert from "assert";
// import assert = require ("assert");
var assert = require('power-assert');
describe('demo', () => {
  it('plus', () => {
    let fn = (a, b) => a + b;
    assert(fn(1, 2) === 3);
  });


  it('async', async () => {
    assert(1 == 1);
  });


  it('promise', async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        assert(2 == 2);
        resolve();
      }, 1000);
    });
  });

  it('callback', cb => {
    setTimeout(() => {
      assert(3 === 3);
      cb();
    });
  });

 

});