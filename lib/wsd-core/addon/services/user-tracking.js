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

import Ember from 'ember';

export default Ember.Service.extend({
    ACTIONS: {
        INTERACTION: 'interaction',
        SHORTCUT: 'shortcut',
    },

    getCommonProperties() {
        const config = Ember.getOwner(this).resolveRegistration('config:environment');
        const { currentPath } = Ember.getOwner(this).lookup('controller:application');

        return {
            environment: config.environment,
            version: config.APP.version,
            path: currentPath,

            // hide title to make context more anonymous
            title: '',
        };
    },

    isEnabled: Ember.computed(function() {
        return Ember.isNone(analytics) === false;
    }).readOnly(),

    visit(properties) {
        if (this.get('isEnabled')) {
            analytics.page(Object.assign({}, this.getCommonProperties(), properties));
        }
    },

    action(name, properties) {
        if (this.get('isEnabled')) {
            analytics.track(
                name,
                Object.assign(
                    {},
                    this.getCommonProperties(),
                    properties
                ),

                // hide default page info to make context more anonymous
                { context: { page: this.getCommonProperties() } }
            );
        }
    },
});
