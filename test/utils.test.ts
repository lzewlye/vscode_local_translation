import * as assert from 'assert'
import * as utils from '../src/utils'

suite("utils", () => {

  test("getFileName", () => {
    assert.equal("甲.java", utils.getFileName("/a/b/c/甲.java"));
  });
});
