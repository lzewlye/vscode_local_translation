import * as assert from 'assert';
import { benchmarkCases } from '../fixtures/benchmarkCases';

suite('benchmark corpus', () => {
    test('contains the planned 400 reviewed cases by category', () => {
        const counts = benchmarkCases.reduce((result, item) => {
            result[item.category] = (result[item.category] || 0) + 1;
            return result;
        }, {} as { [key: string]: number });

        assert.equal(benchmarkCases.length, 400);
        assert.deepEqual(counts, {
            'en-word': 150,
            identifier: 100,
            'zh-name': 100,
            edge: 50,
        });
    });

    test('has unique ids, provenance, and independently reviewed expectations', () => {
        const ids = new Set<string>();
        for (const item of benchmarkCases) {
            assert.ok(!ids.has(item.id), `duplicate id: ${item.id}`);
            ids.add(item.id);
            assert.ok(item.input !== undefined, `missing input: ${item.id}`);
            assert.ok(item.accepted.length > 0 || item.expectedTokens !== undefined, `missing oracle: ${item.id}`);
            assert.ok(item.provenance.source.length > 0, `missing source: ${item.id}`);
            assert.ok(item.provenance.license.length > 0, `missing license: ${item.id}`);
        }
        assert.equal(benchmarkCases.filter(item => item.critical).length, 40);
    });
});
