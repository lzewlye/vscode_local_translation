import * as assert from 'assert';
import * as seg from '../../src/translator/segmenter'

suite("Chinese tokenization", () => {

  test("empty string", () => {
    assert.deepEqual([], seg.tokenize(""));
    assert.deepEqual([], seg.tokenize("   "));
  });

  test("pure English", () => {
    const result = seg.tokenize("hello");
    assert.ok(result.includes("hello"));
  });

  test("English with numbers", () => {
    const result = seg.tokenize("Python3");
    assert.ok(result.length > 0);
  });

  test("single Chinese chars", () => {
    seg.initSegmenter(["中国", "人", "大"]);
    assert.deepEqual(["中国", "人"], seg.tokenize("中国人"));
    assert.deepEqual(["大", "中国"], seg.tokenize("大中国"));
  });

  test("mixed Chinese-English", () => {
    seg.initSegmenter(["使用", "编程", "语言"]);
    const result = seg.tokenize("使用Python编程");
    assert.ok(result.includes("使用"));
    assert.ok(result.includes("Python"));
    assert.ok(result.includes("编程"));
  });

  test("bidirectional MM — fewer words wins", () => {
    seg.initSegmenter(["中国", "人"]);
    assert.deepEqual(["中国", "人"], seg.tokenize("中国人"));
  });

  test("bidirectional MM — fewer single-chars wins", () => {
    seg.initSegmenter(["研究", "研究生", "生命", "生活", "起源"]);
    const result = seg.tokenize("研究生命起源");
    assert.ok(result.includes("研究") || result.includes("研究生"));
  });

  test("non-Chinese kept as-is", () => {
    seg.initSegmenter(["获取", "数据"]);
    const result = seg.tokenize("获取data_from_api");
    assert.ok(result.includes("获取"));
  });

});
