import { BenchmarkCase } from '../fixtures/benchmarkCases';

export interface BenchmarkObservation {
    id: string;
    covered: boolean;
    accepted: boolean;
    tokenizationAccepted?: boolean;
    namingAccepted?: boolean;
    actual?: string;
}

export interface BenchmarkReport {
    total: number;
    coverageRate: number;
    top1AcceptedRate: number;
    identifierTokenizationRate: number;
    namingAcceptedRate: number;
    criticalPassed: number;
    criticalTotal: number;
    failures: Array<BenchmarkObservation & { input: string; category: string }>;
}

export function summarizeBenchmark(
    cases: BenchmarkCase[], observations: BenchmarkObservation[]
): BenchmarkReport {
    const byId = new Map(observations.map(item => [item.id, item]));
    const ordered = cases.map(item => {
        const observation = byId.get(item.id);
        if (!observation) throw new Error(`Missing observation for ${item.id}`);
        return { item, observation };
    });
    const identifier = ordered.filter(row => row.item.category === 'identifier');
    const naming = ordered.filter(row => row.item.category === 'zh-name');
    const critical = ordered.filter(row => row.item.critical);

    return {
        total: ordered.length,
        coverageRate: rate(ordered.filter(row => row.observation.covered).length, ordered.length),
        top1AcceptedRate: rate(ordered.filter(row => row.observation.accepted).length, ordered.length),
        identifierTokenizationRate: rate(
            identifier.filter(row => row.observation.tokenizationAccepted === true).length,
            identifier.length
        ),
        namingAcceptedRate: rate(
            naming.filter(row => row.observation.namingAccepted === true).length,
            naming.length
        ),
        criticalPassed: critical.filter(row => row.observation.accepted).length,
        criticalTotal: critical.length,
        failures: ordered
            .filter(row => !row.observation.accepted)
            .map(row => ({
                ...row.observation,
                input: row.item.input,
                category: row.item.category,
            })),
    };
}

function rate(numerator: number, denominator: number): number {
    return denominator === 0 ? 1 : numerator / denominator;
}
