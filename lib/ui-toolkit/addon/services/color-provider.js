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
