import { test } from 'qunit';
import moduleForAcceptance from 'sysdig-ca/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | index');

test('checking initial replaceWith', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/capture');
  });
});
