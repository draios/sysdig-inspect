/* global d3 */

import Ember from 'ember';
import layout from '../templates/components/sd-time-series';

export default Ember.Component.extend({
    layout,
    tagName: 'svg',
    classNames: ['sd-time-series'],
    attributeBindings: ['width', 'height'],

    data: null,
    width: 100,
    height: 50,
    timestampProp: 'x',
    valueProp: 'y',

    canBeRendered: Ember.computed('width', 'height', function() {
        return this.get('width') > 0 && this.get('height') > 0;
    }).readOnly(),

    yScale: Ember.computed('data', 'height', function() {
        const data = this.get('data');
        if (Ember.isEmpty(data)) {
            return null;
        }

        const yProp = this.get('valueProp');

        return d3.scaleLinear()
            .domain([0, d3.max(data, (d) => d[yProp])])
            .range([0, this.get('height')])
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
            .paddingOuter([0.5])
        ;
    }).readOnly(),

    columns: Ember.computed('data', 'yScale', 'xScale', function() {
        const data = this.get('data');
        if (Ember.isEmpty(data)) {
            return null;
        }

        const xScale = this.get('xScale');
        const bandWidth = xScale.bandwidth();
        const xProp = this.get('timestampProp');

        const yScale = this.get('yScale');
        const [, yMax] = yScale.range();
        const yProp = this.get('valueProp');

        return data.map((d) => {
            return {
                x: xScale(d[xProp]),
                y: yMax - yScale(d[yProp]),
                w: bandWidth,
                h: yScale(d[yProp]),
            };
        });
    }).readOnly(),
});
