import * as assert from 'assert';
import * as seg from '../../src/translator/segmenter';

suite('Chinese tokenization', () => {
    test('returns no tokens for empty input', () => {
        assert.deepEqual([], seg.tokenize(''));
        assert.deepEqual([], seg.tokenize('   '));
    });

    test('splits mixed Chinese, camelCase, and underscore input', () => {
        seg.initSegmenter(['获取', '数据']);
        assert.deepEqual(['获取', 'data', 'From', 'Api'], seg.tokenize('获取dataFrom_Api'));
    });

    test('selects a dictionary-backed segmentation in both directions', () => {
        seg.initSegmenter(['研究', '研究生', '生命', '生活', '起源']);
        const result = seg.tokenize('研究生命起源');
        assert.ok(result.includes('研究') || result.includes('研究生'));
        assert.equal(result.join(''), '研究生命起源');
    });
});
