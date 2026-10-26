import * as assert from 'assert';
import * as dict from '../../src/dictionary';
import * as loader from '../../src/loader';

suite('dictionary structural pressure', () => {
    suiteSetup(async () => {
        await loader.zhEnPromise;
    });

    test('loads the complete dictionaries and forms table', () => {
        assert.ok(loader.enZhReady);
        assert.ok(loader.zhEnReady);
        assert.ok(Object.keys(loader.enZhDict).length >= 700_000);
        assert.ok(Object.keys(loader.zhEnDict).length >= 100_000);
        assert.ok(Object.keys(loader.enZhForms).length >= 80_000);
    });

    test('queries 2,000 deterministic entries without losing the original key', () => {
        const english = deterministicSample(Object.keys(loader.enZhDict), 1_000);
        const chinese = deterministicSample(Object.keys(loader.zhEnDict), 1_000);
        for (const key of [...english, ...chinese]) {
            const result = dict.translate(key);
            assert.equal(result.original, key);
            assert.ok(Array.isArray(result.entries));
        }
        assert.equal(english.length + chinese.length, 2_000);
    });
});

function deterministicSample(values: string[], count: number): string[] {
    const stride = Math.max(1, Math.floor(values.length / count));
    return Array.from({ length: count }, (_, index) => values[index * stride]);
}
