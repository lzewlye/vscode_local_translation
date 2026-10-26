import * as assert from 'assert';
import { summarizeBenchmark } from '../benchmark/evaluator';
import { BenchmarkCase } from '../fixtures/benchmarkCases';

suite('benchmark evaluator', () => {
    test('reports coverage and per-category acceptance rates', () => {
        const cases: BenchmarkCase[] = [
            sample('a', 'en-word'),
            sample('b', 'identifier'),
            sample('c', 'zh-name'),
            sample('d', 'edge'),
        ];
        const report = summarizeBenchmark(cases, [
            { id: 'a', covered: true, accepted: true },
            { id: 'b', covered: true, accepted: false, tokenizationAccepted: true },
            { id: 'c', covered: false, accepted: false, namingAccepted: false },
            { id: 'd', covered: true, accepted: true },
        ]);

        assert.equal(report.total, 4);
        assert.equal(report.coverageRate, 0.75);
        assert.equal(report.top1AcceptedRate, 0.5);
        assert.equal(report.identifierTokenizationRate, 1);
        assert.equal(report.namingAcceptedRate, 0);
        assert.deepEqual(report.failures.map(item => item.id), ['b', 'c']);
    });
});

function sample(id: string, category: BenchmarkCase['category']): BenchmarkCase {
    return {
        id,
        category,
        input: id,
        accepted: ['ok'],
        critical: false,
        provenance: { source: 'project', license: 'MIT' },
    };
}
