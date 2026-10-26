import * as assert from 'assert';
import * as dict from '../../src/dictionary';
import * as loader from '../../src/loader';

suite('dictionary regression coverage', () => {
    suiteSetup(async () => {
        await loader.zhEnPromise;
    });

    test('looks up Chinese and English words', () => {
        const chinese = dict.translate('中国');
        assert.ok(chinese.definition.includes('China') || chinese.definition.includes('Chinese'));

        const english = dict.translate('China');
        assert.ok(english.definition.includes('中国') || english.definition.includes('瓷器'));
    });

    test('translates established identifier regressions', () => {
        assert.equal(dict.translate('eventListener').definition, '事件监听器');
        assert.equal(dict.translate('string_decoder').definition, '字符串_译码器');
        assert.equal(dict.translate('BasicCalculator').definition, '基本的计算器');
        assert.equal(dict.translate('useColors').definition, '使用颜色');
        assert.equal(dict.translate('gettingGoods').definition, '获取货物');
        assert.equal(dict.translate('getStarted').definition, '启动');
        assert.equal(dict.translate('beforeRedesign').definition, '在重新设计之前');
    });

    test('keeps the translation result structure stable', () => {
        const empty = dict.translate('');
        assert.deepEqual(empty, { original: '', definition: '', entries: [] });

        const result = dict.translate('中国');
        assert.equal(result.original, '中国');
        assert.ok(Array.isArray(result.entries));
        assert.ok(result.entries.length > 0);
    });

    test('preserves existing Latin tokens in Chinese-to-English mixed text', () => {
        const result = dict.translate('使用Python');

        assert.equal(result.definition, 'use Python');
        assert.deepEqual(result.entries[1], { word: 'Python', definition: 'Python' });
    });
});
