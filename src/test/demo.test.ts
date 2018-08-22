import assert = require("assert");


describe('demo', () => {
  it('plus', () => {
    let fn = (a, b) => a + b;
    assert(fn(1, 2) === 3);
  });
});