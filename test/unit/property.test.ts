import * as assert from 'assert';
import * as fc from 'fast-check';
import * as enProcessor from '../../src/translator/enZhProcessor';
import * as utils from '../../src/utils';

const word = fc.stringMatching(/^[a-z]{2,8}$/);
const words = fc.array(word, { minLength: 1, maxLength: 6 });

suite('fixed-seed identifier properties', () => {
    test('camelCase, PascalCase, and snake_case preserve the same word sequence', () => {
        fc.assert(fc.property(words, input => {
            const expected = input.join('|');
            const variants = [
                utils.formatVariableName(input, 'camelCase'),
                utils.formatVariableName(input, 'PascalCase'),
                utils.formatVariableName(input, 'snake_case'),
            ];
            for (const variant of variants) {
                assert.equal(enProcessor.extractWords(variant).map(value => value.toLowerCase()).join('|'), expected);
            }
        }), { seed: 111101, numRuns: 1_000 });
    });

    test('formatting a variable name is deterministic and contains only identifier characters', () => {
        fc.assert(fc.property(words, input => {
            for (const style of ['camelCase', 'PascalCase', 'snake_case']) {
                const first = utils.formatVariableName(input, style);
                const second = utils.formatVariableName(input, style);
                assert.equal(first, second);
                assert.match(first, /^[A-Za-z][A-Za-z0-9_]*$/);
            }
        }), { seed: 111102, numRuns: 1_000 });
    });

    test('plural and gerund form metadata reduce to the declared ECDICT root', () => {
        fc.assert(fc.property(word, root => {
            const plural = enProcessor.parseForms(`0:${root}/1:s`);
            const gerund = enProcessor.parseForms(`0:${root}/1:i`);
            const past = enProcessor.parseForms(`0:${root}/1:p`);
            assert.equal(enProcessor.getRoot(`${root}s`, plural), root);
            assert.equal(enProcessor.getRoot(`${root}ing`, gerund), root);
            assert.equal(enProcessor.getRoot(`${root}ed`, past), `${root}ed`);
        }), { seed: 111103, numRuns: 1_000 });
    });
});
