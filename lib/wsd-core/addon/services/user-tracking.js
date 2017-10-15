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

import { isNone } from '@ember/utils';

import { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import Service from '@ember/service';

export default Service.extend({
    ACTIONS: {
        INTERACTION: 'interaction',
        SHORTCUT: 'shortcut',
    },

    platformInfo: null,

    getCommonProperties() {
        const config = getOwner(this).resolveRegistration('config:environment');
        const { currentPath } = getOwner(this).lookup('controller:application');

        return {
            environment: config.environment,
            version: config.APP.version,
            path: currentPath,
            target: config.targetEnv,
            platform: this.get('platformInfo'),

            // hide title to make context more anonymous
            title: '',
        };
    },

    isEnabled: computed(function() {
        return isNone(window.analytics) === false;
    }).readOnly(),

    visit(properties) {
        if (this.get('isEnabled')) {
            window.analytics.page(Object.assign({}, this.getCommonProperties(), properties));
        }
    },

    action(name, properties) {
        if (this.get('isEnabled')) {
            window.analytics.track(
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
