import * as assert from 'assert';
import * as utils from '../../src/utils';

suite('utils', () => {
    test('extracts a file name from a slash-separated path', () => {
        assert.equal('甲.java', utils.getFileName('/a/b/c/甲.java'));
    });

    test('formats all supported variable-name styles', () => {
        assert.equal('getUserName', utils.formatVariableName(['get', 'user', 'name'], 'camelCase'));
        assert.equal('GetUserName', utils.formatVariableName(['get', 'user', 'name'], 'PascalCase'));
        assert.equal('get_user_name', utils.formatVariableName(['get', 'user', 'name'], 'snake_case'));
    });

    test('replaces identifier text literally when it contains regular-expression characters', () => {
        assert.equal('value + value', utils.replaceAllLiteral('$name + $name', '$name', 'value'));
        assert.equal('dot dot aXb', utils.replaceAllLiteral('a.b a.b aXb', 'a.b', 'dot'));
        assert.equal('item foo0', utils.replaceAllLiteral('foo[0] foo0', 'foo[0]', 'item'));
    });
});
