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

import { Promise } from 'rsvp';

import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
    fetchViews: service('fetch-views'),

    store: computed(function() {
        return this.get('fetchViews').fetch();
    }).readOnly(),

    findViewConfiguration(viewId) {
        if (isSpecialView(viewId)) {
            return Promise.resolve(new ViewConfiguration(viewId));
        } else {
            return this.get('fetchViews')
                .fetchById(viewId)
                .loadPromise
                .then(() => this.peekViewConfiguration(viewId))
            ;
        }
    },

    peekViewConfiguration(viewId) {
        if (isSpecialView(viewId)) {
            return new ViewConfiguration(viewId);
        } else {
            const viewPromise = this.get('fetchViews').fetchById(viewId);

            console.assert(viewPromise.hasLoaded, 'ViewConfiguration:peekViewConfiguration', 'Unexpected object state', 'View is expected to be loaded already', viewId);

            return new ViewConfiguration(viewId, viewPromise.view);
        }
    },

    getStepViewConfigurations(steps) {
        return this.getViewConfigurations(steps.length > 1 ? steps[steps.length - 2].key : null);
    },

    getRootViewConfigurations() {
        return this.getViewConfigurations();
    },

    getViewConfigurations(appliesTo) {
        return [
            ...this.get('store.views')
                .filter((view) => view.get('appliesTo').includes(appliesTo || ''))
                .map((view) => this.peekViewConfiguration(view.get('id')))
        ];
    },
});

function isSpecialView(id) {
    return ['overview', 'echo', 'dig'].includes(id);
}

class ViewConfiguration {
    constructor(id, record = null) {
        this.id = id;

        this.record = record;
    }

    get name() {
        if (this.record) {
            return this.record.get('name');
        } else {
            switch (this.id) {
                case 'overview':
                    return 'Overview';
                case 'echo':
                    return 'I/O streams';
                case 'dig':
                    return 'Syscalls';

                default:
                    console.assert(false, 'ViewConfiguration:name', 'Unexpected property value', 'View id not valid, or record not available', this);
                    return this.id;
            }
        }
    }
}
