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

/* global analytics */
/* global window */

import Ember from 'ember';

export default Ember.Service.extend({
    getCommonProperties() {
        const config = Ember.getOwner(this).resolveRegistration('config:environment');

        return {
            environment: config.environment,
            version: config.APP.version,
            path: window.location.hash,
        };
    },

    visit(properties) {
        analytics.page(Object.assign({}, this.getCommonProperties(), properties));
    },

    action(name, properties) {
        analytics.track(name, Object.assign({}, this.getCommonProperties(), properties));
    },
});
