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

import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: {
        drilldownInfoParam: 'dd',
        metricTimelinesParam: 'tl',
        timeFrom: 'f',
        timeTo: 't',
    },

    captureTimelines: Ember.inject.service('capture-timelines'),

    selectedViewId: null,

    filter: null,

    drilldownInfoParam: null,
    metricTimelinesParam: null,
    timeWindow: Ember.computed('model.queryParams.timeFrom', 'model.queryParams.timeTo', function() {
        if (Ember.isNone(this.get('model.queryParams.timeFrom')) === false && Ember.isNone(this.get('model.queryParams.timeTo')) === false) {
            return {
                from: this.get('model.queryParams.timeFrom'),
                to: this.get('model.queryParams.timeTo'),
            };
        } else {
            return null;
        }
    }).readOnly(),
});
