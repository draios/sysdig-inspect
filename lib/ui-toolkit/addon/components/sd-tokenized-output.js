import Ember from 'ember';
import layout from '../templates/components/sd-tokenized-output';

export default Ember.Component.extend({
    layout,
    tagName: 'span',
    classNames: ['sd-tokenized-output'],

    output: null,
    isTokenized: Ember.computed('output', function() {
        return Ember.typeOf(this.get('output')) === 'array';
    }).readOnly(),
});
