/* global window */

import Ember from 'ember';

export default Ember.Service.extend({
    baseURL: Ember.computed(function() {
        if (window && window.process && window.process.type) {
            return 'http://localhost:3000';
        } else {
            return '';
        }
    }).readOnly(),

    buildURL(url) {
        return `${this.get('baseURL')}${url}`;
    },
});
