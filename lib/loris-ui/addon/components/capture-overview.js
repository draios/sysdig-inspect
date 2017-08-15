import Ember from 'ember';
import layout from '../templates/components/capture-overview';

export default Ember.Component.extend({
    layout,
    fetchCaptureSummary: Ember.inject.service('fetch-capture-summary'),

    init(...args) {
        this._super(...args);

        this.get('fetchCaptureSummary').fetch('/Users/davide/Downloads/lo.scap');
    },

    didInsertElement() {
    }
});
