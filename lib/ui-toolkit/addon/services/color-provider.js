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

/* global d3 */

import Ember from 'ember';

const defaultColors = [
    // new category color set provided by Alexis
    // re-ordered for better contrast
    '#5392FF',
    '#FE8500',
    '#9B82F3',
    '#FF509E',
    '#FCCF08',
    '#9753E1',
    '#40D5BB',
    '#FF5C49',
    '#34BC6E',
];

export default Ember.Service.extend({
    buckets: null,

    init() {
        this._super(...arguments);

        this.set('buckets', {});
    },

    getBucket(bucketName = 'DEFAULTS') {
        let bucket = this.get(`buckets.${bucketName}`);
        if (bucket === undefined) {
            bucket = {
                mapping: {},
                nextDefaultColorIndex: 0,
            };
            this.set(`buckets.${bucketName}`, bucket);
        }

        return bucket;
    },

    getColor(id, bucketName = 'DEFAULTS') {
        const bucket = this.getBucket(bucketName);

        let color = bucket.mapping[id];

        if (color === undefined) {
            color = defaultColors[bucket.nextDefaultColorIndex];
            bucket.nextDefaultColorIndex = (bucket.nextDefaultColorIndex + 1) % defaultColors.length;
            bucket.mapping[id] = color;
        }

        return color;
    },

    setColor(id, color, bucketName = 'DEFAULTS') {
        const bucket = this.getBucket(bucketName);

        bucket.mapping[id] = color;
    },

    setDefaults(defaults, bucketName = 'DEFAULTS') {
        Object.keys(defaults).forEach((k) => {
            this.setColor(k, defaults[k], bucketName);
        });
    },

    changeOpacity(color, opacity) {
        const rgb = d3.color(color).rgb();
        return d3.rgb(rgb.r, rgb.g, rgb.b, opacity).toString();
    },
});
