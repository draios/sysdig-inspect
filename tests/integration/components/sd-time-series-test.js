import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sd-time-series', 'Integration | Component | time series', {
    integration: true,
});

test('it renders', function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{sd-time-series}}`);

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(hbs`
        {{#sd-time-series}}
            template block text
        {{/sd-time-series}}
    `);

    assert.equal(this.$().text().trim(), 'template block text');
});
