export const MAX_VSIX_BYTES = 22 * 1024 * 1024;

export const expectedDictionaryEntries: string[] = [
    ...Array.from(
        { length: 16 },
        (_, index) => `extension/out/src/dictData/enZh/enZh${index}.js`
    ),
    'extension/out/src/dictData/enZh/forms.js',
    ...Array.from(
        { length: 4 },
        (_, index) => `extension/out/src/dictData/zhEn/zhEn${index}.js`
    ),
];

export interface VsixVerification {
    dictionaryFileCount: number;
    sizeBytes: number;
}

export function verifyVsixEntries(entries: readonly string[], sizeBytes: number): VsixVerification {
    const sourceDictionary = entries.find(entry => entry.startsWith('extension/src/dictData/'));
    if (sourceDictionary) {
        throw new Error(`VSIX contains source dictionary data: ${sourceDictionary}`);
    }

    for (const expected of expectedDictionaryEntries) {
        const count = entries.filter(entry => entry === expected).length;
        if (count === 0) throw new Error(`Missing dictionary entry: ${expected}`);
        if (count !== 1) throw new Error(`Dictionary entry must occur exactly once: ${expected} (${count})`);
    }

    if (sizeBytes > MAX_VSIX_BYTES) {
        throw new Error(`VSIX is ${sizeBytes} bytes; maximum allowed size is 22 MiB`);
    }

    return {
        dictionaryFileCount: expectedDictionaryEntries.length,
        sizeBytes,
    };
}
