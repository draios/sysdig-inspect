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

export default Component.extend({
    tagName: 'g',
    classNames: ['sd-viz-histogram-series'],
    attributeBindings: ['transform'],
    layoutProvider: service('layout-provider'),
    colorProvider: service('color-provider'),

    height: null,
    width: null,
    data: null,
    timestampProp: null,
    valueProp: null,
    hoverTimestamp: null,

    columnColor: null,
    emptyColumnColor: computed(function() {
        return this.get('colorProvider').getColor('HISTOGRAM_COLUMN_EMPTY');
    }).readOnly(),

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
            .range([1, this.get('height')])
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
            .paddingOuter([0.1])
        ;
    }).readOnly(),

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.update());
    },

    didUpdateAttrs() {
        this.get('layoutProvider').whenSettled(() => this.update());
    },

    update() {
        const columnColor = this.get('columnColor');
        const emptyColumnColor = this.get('emptyColumnColor');

        const xScale = this.get('xScale');
        const bandWidth = xScale.bandwidth();
        const xProp = this.get('timestampProp');

        const yScale = this.get('yScale');
        const [, yMax] = yScale.range();
        const yProp = this.get('valueProp');

        const elements = d3.select(`#${this.get('elementId')}`)
            .selectAll('rect')
            .data(this.get('data'))
            .attr('x', function(d) {
                return xScale(d[xProp]);
            })
            .attr('y', function(d) {
                return yMax - yScale(d[yProp]);
            })
            .attr('width', function() {
                return bandWidth;
            })
            .attr('height', function(d) {
                return yScale(d[yProp]);
            })
            .attr('fill', function(d) {
                return d[yProp] === 0 ? emptyColumnColor : columnColor;
            })
        ;

        elements.enter()
            .append('rect')
            .classed('sd-viz-histogram-series__column', true)
            .attr('x', function(d) {
                return xScale(d[xProp]);
            })
            .attr('y', function(d) {
                return yMax - yScale(d[yProp]);
            })
            .attr('width', function() {
                return bandWidth;
            })
            .attr('height', function(d) {
                return yScale(d[yProp]);
            })
            .attr('fill', function(d) {
                return d[yProp] === 0 ? emptyColumnColor : columnColor;
            })
        ;

        elements.enter()
            .remove('rect')
        ;
    },
});
