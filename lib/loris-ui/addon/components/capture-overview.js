import Ember from 'ember';
import layout from '../templates/components/capture-overview';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-overview'],
    fetchCaptureSummary: Ember.inject.service('fetch-capture-summary'),

    filePath: null,
    captureSummary: null,

    init(...args) {
        this._super(...args);

        this.set('captureSummary', this.get('fetchCaptureSummary').fetch(this.get('filePath')));
    },
});
