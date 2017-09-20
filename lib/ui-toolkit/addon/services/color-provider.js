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
    '#A6CEE3',
    '#1F78B4',
    '#B2DF8A',
    '#33A02C',
    '#FB9A99',
    '#E31A1C',
    '#FDBF6F',
    '#FF7F00',
    '#CAB2D6',
    '#6A3D9A',
    '#FFFF99',
    '#B15928'
];

export default Ember.Service.extend({
    mapping: null,
    nextDefaultColorIndex: 0,

    init() {
        this._super(...arguments);

        this.set('mapping', {});
    },

    getColor(id) {
        let color = this.get(`mapping.${id}`);

        if (color === undefined) {
            color = defaultColors[this.get('nextDefaultColorIndex')];
            this.incrementProperty('nextDefaultColorIndex', 1);
            this.set(`mapping.${id}`, color);
        }

        return color;
    },

    setColor(id, color) {
        this.set(`mapping.${id}`, color);
    },

    changeOpacity(color, opacity) {
        const rgb = d3.color(color).rgb();
        return d3.rgb(rgb.r, rgb.g, rgb.b, opacity).toString();
    },
});
