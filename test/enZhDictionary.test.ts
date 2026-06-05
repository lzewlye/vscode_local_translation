import * as assert from 'assert'
import * as dict from '../src/dictionary'

suite("en→zh lookup", () => {

  test("single English word", () => {
    const result = dict.translate("China");
    assert.ok(
      result.definition.includes("中国") || result.definition.includes("瓷器"),
      `Expected 中国 or 瓷器, got: ${result.definition}`
    );
  });

  test("camelCase translation", () => {
    checkDef("eventListener", "事件监听器");
  });

  test("underscore translation", () => {
    checkDef("string_decoder", "字符串_译码器");
  });

  test("uppercase word", () => {
    const result = dict.translate("ACCOUNT");
    assert.ok(
      result.definition.includes("帐户") || result.definition.includes("账"),
      `Expected 帐户 or 账, got: ${result.definition}`
    );
  });

  test("adjective+noun pairing", () => {
    checkDef("BasicCalculator", "基本的计算器");
  });

  test("plural form reduction", () => {
    checkDef("useColors", "使用颜色");
  });

  test("present participle reduction", () => {
    checkDef("gettingGoods", "获取货物");
  });

  test("phrase priority", () => {
    checkDef("getStarted", "启动");
  });

  test("custom name mapping", () => {
    checkDef("eventListener", "事件监听器");
  });

  test("ellipsis replacement", () => {
    checkDef("beforeRedesign", "在重新设计之前");
  });

  test("empty string", () => {
    const result = dict.translate("");
    assert.equal(result.entries.length, 0);
  });

  function checkDef(original: string, expected: string) {
    assert.equal(expected, dict.translate(original).definition,
      `${original}: expected "${expected}", got "${dict.translate(original).definition}"`);
  }
});
