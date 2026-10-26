import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as dict from '../../src/dictionary';
import * as loader from '../../src/loader';
import * as enProcessor from '../../src/translator/enZhProcessor';
import * as segmenter from '../../src/translator/segmenter';
import { benchmarkCases, BenchmarkCase } from '../fixtures/benchmarkCases';
import { baseline110 as baseline } from '../fixtures/baseline110';
import { BenchmarkObservation, summarizeBenchmark } from './evaluator';

suite('translation quality benchmark', () => {
    suiteSetup(async () => {
        await loader.zhEnPromise;
    });

    test('writes the reviewed 400-case quality report and passes all critical cases', () => {
        const observations = benchmarkCases.map(observe);
        const report = summarizeBenchmark(benchmarkCases, observations);
        const artifactDirectory = path.resolve(__dirname, '..', '..', '..', '.artifacts');
        fs.mkdirSync(artifactDirectory, { recursive: true });
        fs.writeFileSync(
            path.join(artifactDirectory, 'benchmark-report.json'),
            JSON.stringify(report, null, 2) + '\n',
            'utf8'
        );

        console.log(JSON.stringify({
            total: report.total,
            coverageRate: report.coverageRate,
            top1AcceptedRate: report.top1AcceptedRate,
            identifierTokenizationRate: report.identifierTokenizationRate,
            namingAcceptedRate: report.namingAcceptedRate,
            critical: `${report.criticalPassed}/${report.criticalTotal}`,
            failures: report.failures.length,
        }));

        assert.equal(report.total, 400);
        assert.equal(
            report.criticalPassed,
            report.criticalTotal,
            `Critical failures: ${report.failures.filter(failure => {
                const item = benchmarkCases.find(candidate => candidate.id === failure.id);
                return item && item.critical;
            }).map(failure => `${failure.id}=${failure.actual}`).join(', ')}`
        );
        assert.ok(report.coverageRate >= baseline.coverageRate, 'coverage regressed from 1.1.0');
        assert.ok(report.top1AcceptedRate >= baseline.top1AcceptedRate, 'top-one acceptance regressed from 1.1.0');
        assert.ok(
            report.identifierTokenizationRate >= baseline.identifierTokenizationRate,
            'identifier tokenization regressed from 1.1.0'
        );
        assert.ok(report.namingAcceptedRate >= baseline.namingAcceptedRate, 'naming acceptance regressed from 1.1.0');
    });
});

function observe(item: BenchmarkCase): BenchmarkObservation {
    const result = dict.translate(item.input);
    const actual = result.definition || '';
    const accepted = item.accepted.some(candidate => matches(actual, candidate));
    let tokenizationAccepted: boolean | undefined;
    let namingAccepted: boolean | undefined;

    if (item.category === 'identifier' && item.expectedTokens) {
        tokenizationAccepted = sameTokens(enProcessor.extractWords(item.input), item.expectedTokens);
    }
    if (item.category === 'zh-name') {
        namingAccepted = accepted;
    }
    if (item.category === 'edge' && item.expectedTokens) {
        tokenizationAccepted = sameTokens(segmenter.tokenize(item.input), item.expectedTokens);
    }

    return {
        id: item.id,
        covered: actual.length > 0 && normalize(actual) !== normalize(item.input),
        accepted,
        tokenizationAccepted,
        namingAccepted,
        actual,
    };
}

function matches(actual: string, expected: string): boolean {
    const normalizedActual = normalize(actual);
    const normalizedExpected = normalize(expected);
    if (normalizedExpected.length === 0) return normalizedActual.length === 0;
    return normalizedActual.includes(normalizedExpected);
}

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '');
}

function sameTokens(actual: string[], expected: string[]): boolean {
    return actual.map(normalize).join('|') === expected.map(normalize).join('|');
}
