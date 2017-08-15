import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('summary-metric', 'Integration | Component | summary metric', {
    integration: true,
});

test('it renders', function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{summary-metric}}`);

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(hbs`
        {{#summary-metric}}
            template block text
        {{/summary-metric}}
    `);

    assert.equal(this.$().text().trim(), 'template block text');
});
