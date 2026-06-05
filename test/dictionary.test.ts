import * as assert from 'assert'
import * as dict from '../src/dictionary'

suite("zh→en lookup", () => {

  test("empty string", () => {
    assert.deepEqual(
      { original: "", definition: "", entries: [] },
      dict.translate("")
    );
  });

  test("whitespace only", () => {
    const result = dict.translate("   ");
    assert.equal(result.entries.length, 0);
  });

  test("single Chinese word", () => {
    const result = dict.translate("中国");
    assert.equal(result.original, "中国");
    assert.ok(
      result.definition.includes("China") || result.definition.includes("Chinese"),
      `Expected China or Chinese, got: ${result.definition}`
    );
  });

  test("unknown word", () => {
    const result = dict.translate("不存在的中文词xyz");
    assert.equal(result.original, "不存在的中文词xyz");
  });

  test("pure English", () => {
    const result = dict.translate("HelloWorld");
    assert.equal(result.original, "HelloWorld");
  });

  test("custom name mapping", () => {
    const result = dict.translate("获取");
    assert.equal(result.definition, "get");
  });

  test("custom phrase mapping", () => {
    const result = dict.translate("用户名称");
    assert.equal(result.definition, "userName");
  });

  test("mixed Chinese-English", () => {
    const result = dict.translate("使用Python");
    assert.ok(result.entries.length >= 2, `entry count: ${result.entries.length}`);
  });

  test("Translation structure", () => {
    const result = dict.translate("中国");
    assert.ok("original" in result);
    assert.ok("definition" in result);
    assert.ok("entries" in result);
    assert.ok(Array.isArray(result.entries));
    if (result.entries.length > 0) {
      const entry = result.entries[0];
      assert.ok("word" in entry);
      assert.ok("definition" in entry);
      assert.ok(!("forms" in entry) || entry.forms === undefined,
        "CC-CEDICT entries should not have word forms");
    }
  });

});
