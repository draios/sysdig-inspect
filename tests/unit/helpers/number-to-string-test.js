import { module, test } from 'qunit';
import { numberToString } from 'ui-toolkit/helpers/number-to-string';

module('Unit | Helper | number-to-string', function() {
    test('relativeTime uses 60/60/24 scales for minutes, hours and days', function(assert) {
        assert.equal(numberToString([0], { dataType: 'relativeTime' }), ' 0');
        assert.equal(numberToString([1], { dataType: 'relativeTime' }), ' 1 ns');
        assert.equal(numberToString([1000], { dataType: 'relativeTime' }), ' 1 us');
        assert.equal(numberToString([1000000], { dataType: 'relativeTime' }), ' 1 ms');
        assert.equal(numberToString([1000000000], { dataType: 'relativeTime' }), ' 1 s');
        assert.equal(numberToString([3e10], { dataType: 'relativeTime' }), ' 30 s');
        assert.equal(numberToString([6e10], { dataType: 'relativeTime' }), ' 1 min');
        assert.equal(numberToString([3.6e12], { dataType: 'relativeTime' }), ' 1 h');
        assert.equal(numberToString([8.64e13], { dataType: 'relativeTime' }), ' 1 d');
    });

    test('default decimal scale is unchanged', function(assert) {
        assert.equal(numberToString([0], {}), ' 0');
        assert.equal(numberToString([1000], {}), ' 1 K');
        assert.equal(numberToString([1000000], {}), ' 1 M');
        assert.equal(numberToString([1000000000], {}), ' 1 G');
    });

    test('passes non-numbers through unchanged', function(assert) {
        assert.equal(numberToString(['x'], { dataType: 'relativeTime' }), 'x');
        assert.equal(numberToString([null], { dataType: 'relativeTime' }), null);
    });
});
