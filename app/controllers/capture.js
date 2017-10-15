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

import { isNone } from '@ember/utils';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import electronUtils from 'wsd-core/utils/electron';

export default Controller.extend({
    queryParams: {
        drilldownInfoParam: 'dd',
        metricTimelinesParam: 'tl',
        timeFrom: 'f',
        timeTo: 't',
    },

    application: controller('application'),
    captureTimelines: service('capture-timelines'),

    selectedViewId: null,

    filter: null,

    drilldownInfoParam: null,
    metricTimelinesParam: null,
    timeWindow: computed('model.queryParams.timeFrom', 'model.queryParams.timeTo', function() {
        if (isNone(this.get('model.queryParams.timeFrom')) === false && isNone(this.get('model.queryParams.timeTo')) === false) {
            return {
                from: this.get('model.queryParams.timeFrom'),
                to: this.get('model.queryParams.timeTo'),
            };
        } else {
            return null;
        }
    }).readOnly(),

    actions: {
        openFileBrowser() {
            if (electronUtils.isElectron()) {
                this.get('application').send('openFileBrowser');
            }
        },

        openFile(value) {
            this.get('application').send('openFile', value);
        },
    },
});
