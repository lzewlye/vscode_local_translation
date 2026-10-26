import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import * as dict from '../../src/dictionary';
import * as loader from '../../src/loader';
import { baseline110 } from '../fixtures/baseline110';
import { benchmarkCases } from '../fixtures/benchmarkCases';

suite('lookup performance benchmark', () => {
    suiteSetup(async () => {
        await loader.zhEnPromise;
    });

    test('records 10,000 warm lookups with percentile and heap measurements', () => {
        const inputs = benchmarkCases.slice(0, 100).map(item => item.input);
        for (let index = 0; index < 1_000; index++) dict.translate(inputs[index % inputs.length]);

        const heapBefore = process.memoryUsage().heapUsed;
        const durations: number[] = [];
        const roundTotals: number[] = [];
        for (let round = 0; round < 7; round++) {
            const started = performance.now();
            for (let index = 0; index < 10_000; index++) {
                const lookupStarted = performance.now();
                dict.translate(inputs[index % inputs.length]);
                durations.push(performance.now() - lookupStarted);
            }
            roundTotals.push(performance.now() - started);
        }
        const heapAfter = process.memoryUsage().heapUsed;
        durations.sort((left, right) => left - right);
        roundTotals.sort((left, right) => left - right);
        const medianRoundMs = percentile(roundTotals, 0.50);

        const report = {
            lookups: 10_000,
            rounds: roundTotals.length,
            measuredLookups: durations.length,
            medianRoundMs,
            lookupsPerSecond: 10_000 / (medianRoundMs / 1_000),
            p50Ms: percentile(durations, 0.50),
            p95Ms: percentile(durations, 0.95),
            heapBeforeBytes: heapBefore,
            heapAfterBytes: heapAfter,
            heapDeltaBytes: heapAfter - heapBefore,
        };
        const artifactDirectory = path.resolve(__dirname, '..', '..', '..', '.artifacts');
        fs.mkdirSync(artifactDirectory, { recursive: true });
        fs.writeFileSync(
            path.join(artifactDirectory, 'performance-report.json'),
            JSON.stringify(report, null, 2) + '\n',
            'utf8'
        );
        console.log(JSON.stringify(report));

        assert.equal(report.lookups, 10_000);
        assert.equal(report.measuredLookups, 70_000);
        assert.ok(Number.isFinite(report.p50Ms));
        assert.ok(Number.isFinite(report.p95Ms));
        assert.ok(report.p95Ms >= report.p50Ms);
        assert.ok(report.lookupsPerSecond > 0);
        assert.ok(
            report.medianRoundMs <= baseline110.performance.medianRoundMs * 1.10,
            `median round ${report.medianRoundMs.toFixed(3)}ms exceeds the 1.1.0 baseline by more than 10%`
        );
        assert.ok(
            report.p95Ms <= baseline110.performance.p95Ms * 1.10,
            `P95 ${report.p95Ms.toFixed(6)}ms exceeds the 1.1.0 baseline by more than 10%`
        );
        assert.ok(
            report.heapAfterBytes <= baseline110.performance.heapAfterBytes * 1.10,
            `heap-after ${report.heapAfterBytes} bytes exceeds the 1.1.0 baseline by more than 10%`
        );
    });
});

function percentile(sorted: number[], ratio: number): number {
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}
