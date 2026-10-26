export const baseline110 = {
    total: 400,
    coverageRate: 0.97,
    top1AcceptedRate: 0.6975,
    identifierTokenizationRate: 0.98,
    namingAcceptedRate: 0.95,
    criticalPassed: 40,
    criticalTotal: 40,
    performance: {
        vscodeVersion: '1.141.2',
        sampleRuns: 3,
        // High-water marks from three clean 1.1.0 runs. Extension-host scheduling
        // makes a single micro-benchmark run too noisy to be a useful gate.
        medianRoundMs: 54.7169,
        p95Ms: 0.0086,
        heapAfterBytes: 317_470_604,
    },
};
