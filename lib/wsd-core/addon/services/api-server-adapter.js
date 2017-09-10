/* global window */

import Ember from 'ember';

export default Ember.Service.extend({
    configTarget: Ember.computed(function() {
        if (window && window.process && window.process.type) {
            return 'ELECTRON';
        } else if (Ember.getOwner(this).factoryFor('config:environment').class.targetEnv === 'secure') {
            return 'SECURE';
        } else {
            return 'WEB';
        }
    }).readOnly(),

    baseURL: Ember.computed(function() {
        switch (this.get('configTarget')) {
            case 'ELECTRON':
                return 'http://localhost:3000';
            case 'WEB':
                return '';
            default:
                return '/api/sysdig';
        }
    }).readOnly(),

    buildURL(url) {
        if (url === '/capture/views') {
            switch (this.get('configTarget')) {
                case 'ELECTRON':
                case 'WEB':
                    return `${this.get('baseURL')}${url}`;
                default:
                    return `${this.get('baseURL')}/views`;
            }
        } else {
            return `${this.get('baseURL')}${url}`;
        }
    },
});
