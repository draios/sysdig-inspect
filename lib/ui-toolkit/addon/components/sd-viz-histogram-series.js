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

export default Ember.Component.extend({
    tagName: 'g',
    classNames: ['sd-viz-histogram-series'],
    attributeBindings: ['transform'],
    layoutProvider: Ember.inject.service('layout-provider'),

    height: null,
    width: null,
    data: null,
    timestampProp: null,
    valueProp: null,

    transform: Ember.computed('translateX', 'translateY', function() {
        const x = this.get('translateX') || 0;
        const y = this.get('translateY') || 0;

        return `translate(${x}, ${y})`;
    }).readOnly(),

    yScale: Ember.computed('data', 'height', function() {
        const data = this.get('data');
        if (Ember.isEmpty(data)) {
            return null;
        }

        const yProp = this.get('valueProp');

        return d3.scaleLinear()
            .domain([0, d3.max(data, (d) => d[yProp])])
            .range([1, this.get('height')])
        ;
    }).readOnly(),

    xScale: Ember.computed('data', 'width', function() {
        const data = this.get('data');
        if (Ember.isEmpty(data)) {
            return null;
        }

        const xProp = this.get('timestampProp');

        return d3.scaleBand()
            .domain(data.map((d) => d[xProp]))
            .range([0, this.get('width')])
            .paddingInner([0.2])
            .paddingOuter([0])
        ;
    }).readOnly(),

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.update());
    },

    didUpdateAttrs() {
        this.get('layoutProvider').whenSettled(() => this.update());
    },

    update() {
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
            .classed('sd-viz-histogram-series__column--is-empty', function(d) {
                return d[yProp] === 0;
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
            .classed('sd-viz-histogram-series__column--is-empty', function(d) {
                return d[yProp] === 0;
            })
        ;

        elements.enter()
            .remove('rect')
        ;
    },
});
