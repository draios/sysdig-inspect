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

import { isEmpty } from '@ember/utils';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/sd-viz-line';

export default Component.extend({
    layout,
    tagName: 'g',
    classNames: ['sd-viz-line'],
    attributeBindings: ['transform'],
    layoutProvider: service('layout-provider'),

    height: null,
    width: null,
    data: null,
    timestampProp: null,
    valueProp: null,

    transform: computed('translateX', 'translateY', function() {
        const x = this.get('translateX') || 0;
        const y = this.get('translateY') || 0;

        return `translate(${x}, ${y})`;
    }).readOnly(),

    yScale: computed('data', 'height', function() {
        const data = this.get('data');
        if (isEmpty(data)) {
            return null;
        }

        const yProp = this.get('valueProp');

        return d3.scaleLinear()
            .domain([0, d3.max(data, (d) => d[yProp])])
            .range([0, this.get('height')])
        ;
    }).readOnly(),

    xScale: computed('data', 'width', function() {
        const data = this.get('data');
        if (isEmpty(data)) {
            return null;
        }

        const xProp = this.get('timestampProp');

        return d3.scaleBand()
            .domain(data.map((d) => d[xProp]))
            .range([0, this.get('width')])
            .paddingInner([0.2])
            .paddingOuter([0.5])
        ;
    }).readOnly(),

    lineGenerator: computed('data', 'xScale', 'yScale', function() {
        const xScale = this.get('xScale');
        const xProp = this.get('timestampProp');

        const yScale = this.get('yScale');
        const [, yMax] = yScale.range();
        const yProp = this.get('valueProp');

        return d3.line()
            .curve(d3.curveCatmullRom.alpha(0.5))
            .x(function(d) {
                return xScale(d[xProp]);
            })
            .y(function(d) {
                return yMax - yScale(d[yProp]);
            })
        ;
    }).readOnly(),

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.update());
    },

    didUpdateAttrs() {
        this.get('layoutProvider').whenSettled(() => this.update());
    },

    update() {
        d3.select(`#${this.get('elementId')} path`)
            .attr('d', this.get('lineGenerator')(this.get('data')))
        ;
    },
});
