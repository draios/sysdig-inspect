import Ember from 'ember';

export default Ember.TextField.extend({
    classNames: ['sd-text-field'],

    oneWayValue: null,

    init() {
        this._super(...arguments);

        this.set('value', this.get('oneWayValue'));
    },

    didUpdateAttrs() {
        this.set('value', this.get('oneWayValue'));
    },

    _elementValueDidChange() {
        this._super(...arguments);

        if (this.get('value') !== this.get('oneWayValue')) {
            this.sendAction('changeValue', this.get('value'));
        }
    },
});
