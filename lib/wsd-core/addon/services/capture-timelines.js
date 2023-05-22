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

import { isEmpty } from '@ember/utils';

import Service from '@ember/service';

export default Service.extend({
    timelines: null,

    init() {
        this._super(...arguments);

        this.set('timelines', []);
    },

    setCurrent(timelines) {
        this.set('timelines', timelines);
    },

    toggle(metricName) {
        const timelines = this.get('timelines');
        let newTimelines;

        if (timelines.includes(metricName)) {
            newTimelines = timelines.filter((name) => name !== metricName);
        } else {
            newTimelines = [metricName].concat(timelines);
        }

        return newTimelines;
    },

    remove(metricName) {
        const timelines = this.get('timelines');
        let newTimelines;

        if (timelines.includes(metricName)) {
            newTimelines = timelines.filter((name) => name !== metricName);
        } else {
            newTimelines = timelines;
        }

        return newTimelines;
    },

    deserializeFromQueryParam(param) {
        if (isEmpty(param)) {
            return [];
        } else {
            return param.split(',');
        }
    },

    serializeToQueryParam(timelines) {
        if (isEmpty(timelines)) {
            return null;
        } else {
            return timelines.join(',');
        }
    },
});
