/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* global window */

import Ember from 'ember';
import Cookies from 'js-cookie';

export default Ember.Service.extend({
    session: Ember.inject.service('session'),

    configTarget: Ember.computed(function() {
        if (window && window.process && window.process.type) {
            return 'ELECTRON';
        } else if (Ember.getOwner(this).factoryFor('config:environment').class.targetEnv === 'web') {
            return 'WEB_SD';
        } else {
            return 'WEB';
        }
    }).readOnly(),

    baseURL: Ember.computed(function() {
        switch (this.get('configTarget')) {
            case 'ELECTRON':
                return `http://localhost:${this.get('serverPort')}`;
            case 'WEB':
                return '';
            default:
                return '/api/sysdig';
        }
    }).readOnly(),

    serverPort: Ember.computed(function() {
        switch (this.get('configTarget')) {
            case 'ELECTRON': {
                const { remote } = requireNode('electron');

                return remote.getGlobal('serverPort');
            }
            default:
                return null;
        }
    }).readOnly(),

    headers: Ember.computed('session.refererProduct', function() {
        switch (this.get('configTarget')) {
            case 'WEB_SD':
                return {
                    'X-Sysdig-Product': this.get('session.refererProduct'),
                    'X-XSRF-TOKEN-SDC': Cookies.get('XSRF-TOKEN-SDC') || '',
                    'X-XSRF-TOKEN-SDS': Cookies.get('XSRF-TOKEN-SDS') || '',
                };
            default:
                return {};
        }
    }).readOnly(),

    init(...args) {
        this._super(...args);

        if (this.get('configTarget') === 'WEB_SD') {
            // Set HTTP header to calls through jQuery to identify the referer product (if any)
            Ember.$.ajaxSetup({
                dataType: 'json',
                contentType: 'application/json',
                beforeSend: (xhr) => {
                    let productName = this.get('headers.X-Sysdig-Product');
                    let xsrfCookieValueSDC = this.get('headers.X-XSRF-TOKEN-SDC');
                    let xsrfCookieValueSDS = this.get('headers.X-XSRF-TOKEN-SDS');
                    xhr.setRequestHeader('X-Sysdig-Product', productName);
                    if (xsrfCookieValueSDC) {
                        xhr.setRequestHeader('X-XSRF-TOKEN-SDC', xsrfCookieValueSDC);
                    }
                    if (xsrfCookieValueSDS) {
                        xhr.setRequestHeader('X-XSRF-TOKEN-SDS', xsrfCookieValueSDS);
                    }
                },
            });
        }
    },

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
