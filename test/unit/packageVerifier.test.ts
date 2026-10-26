import * as assert from 'assert';
import { expectedDictionaryEntries, verifyVsixEntries } from '../../scripts/packageVerifier';

suite('VSIX package verifier', () => {
    test('accepts one complete dictionary set below the size limit', () => {
        const result = verifyVsixEntries(expectedDictionaryEntries, 21 * 1024 * 1024);

        assert.equal(result.dictionaryFileCount, 21);
        assert.equal(result.sizeBytes, 21 * 1024 * 1024);
    });

    test('rejects missing, duplicate, source-tree, and oversized dictionary data', () => {
        assert.throws(
            () => verifyVsixEntries(expectedDictionaryEntries.slice(1), 1),
            /Missing dictionary entry/
        );
        assert.throws(
            () => verifyVsixEntries([...expectedDictionaryEntries, expectedDictionaryEntries[0]], 1),
            /must occur exactly once/
        );
        assert.throws(
            () => verifyVsixEntries([...expectedDictionaryEntries, 'extension/src/dictData/enZh/enZh0.js'], 1),
            /source dictionary data/
        );
        assert.throws(
            () => verifyVsixEntries(expectedDictionaryEntries, 22 * 1024 * 1024 + 1),
            /22 MiB/
        );
    });
});
