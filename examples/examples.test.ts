import * as assert from 'assert';

describe('Example tests', () => {
  it('test with ', () => {
    assert.strictEqual(true, true);
  });

  it("test with ' single quote", () => {
    assert.strictEqual(true, true);
  });

  it('test with " double quote', () => {
    assert.strictEqual(true, true);
  });

  it('test with () parenthesis', () => {
    assert.strictEqual(true, true);
  });

  it('test with [ square bracket', () => {
    assert.strictEqual(true, true);
  });

  it(`test with
lf`, () => {
    assert.strictEqual(true, true);
  });

  it(`test with \nmanual lf`, () => {
    assert.strictEqual(true, true);
  });

  it(`test with \r\nmanual crlf`, () => {
    assert.strictEqual(true, true);
  });

  it('test with %var%', () => {
    assert.strictEqual(true, true);
  });

  const v = 'interpolated string';
  it(`test with ${v}`, () => {
    assert.strictEqual(true, true);
  });

  it('test with $var', () => {
    assert.strictEqual(true, true);
  });

  it('test with `backticks`', () => {
    assert.strictEqual(true, true);
  });

  it('test with regex .*$^|[]', () => {
    assert.strictEqual(true, true);
  });
});

// #311
// it.each([1, 2])('test with generated %i', (id) => {
//   assert.strictEqual(true, true);
// });

describe('nested', () => {
  describe('a', () => {
    it('b', () => {
      assert.strictEqual(true, true);
    });
  });
});

// #299
class TestClass {
  myFunction() {
    // nothing
  }
}
it(TestClass.prototype.myFunction.name, () => {
  assert.strictEqual(true, true);
});