/* global d3 */

import Ember from 'ember';
import layout from '../templates/components/sd-time-series';

export default Ember.Component.extend({
    layout,
    tagName: 'svg',
    classNames: ['sd-time-series'],
    classNameBindings: ['themeClassName', 'isSelected:sd-time-series--is-selected'],
    attributeBindings: ['width', 'height'],

    data: null,
    isSelected: false,
    width: 100,
    height: 50,
    timestampProp: 'x',
    valueProp: 'y',

    theme: null,
    themeClassName: Ember.computed('theme', function() {
        if (this.get('theme')) {
            return `sd-time-series--theme-${this.get('theme')}`;
        } else {
            return null;
        }
    }).readOnly(),

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

    isSelecting: false,
    selection: null,

    updateSelection(cursorPosition, isStart) {
        if (isStart) {
            return {
                referenceOffset: cursorPosition,
                left: cursorPosition,
                right: cursorPosition,
                width: 0,
                fromBand: this.positionToBand(cursorPosition, this.get('xScale')),
                toBand: this.positionToBand(cursorPosition, this.get('xScale')),
            };
        } else {
            const referenceOffset = this.get('selection.referenceOffset');
            if (cursorPosition < referenceOffset) {
                return {
                    referenceOffset,
                    left: cursorPosition,
                    right: referenceOffset,
                    width: referenceOffset - cursorPosition,
                    fromBand: this.positionToBand(cursorPosition, this.get('xScale')),
                    toBand: this.positionToBand(referenceOffset, this.get('xScale')),
                };
            } else {
                return {
                    referenceOffset,
                    left: referenceOffset,
                    right: cursorPosition,
                    width: cursorPosition - referenceOffset,
                    fromBand: this.positionToBand(referenceOffset, this.get('xScale')),
                    toBand: this.positionToBand(cursorPosition, this.get('xScale')),
                };
            }
        }
    },

    positionToBand(position, scale) {
        const po = scale.paddingOuter();
        const pi = scale.paddingInner();
        const bandWidth = scale.bandwidth();
        const step = scale.step();
        const domain = scale.domain();

        const index = Math.trunc((position - (po - pi / 2) * step) / (bandWidth + pi * step));

        if (index < domain.length) {
            return domain[index];
        } else {
            return domain[domain.length - 1];
        }
    },

    mouseDown(e) {
        this.setProperties({
            isSelecting: true,
            selection: this.updateSelection(e.offsetX, true),
        });
    },

    mouseMove(e) {
        if (this.get('isSelecting')) {
            this.setProperties({
                selection: this.updateSelection(e.offsetX),
            });
        }
    },

    mouseUp(e) {
        if (this.get('isSelecting')) {
            this.setProperties({
                isSelecting: false,
                selection: this.updateSelection(e.offsetX),
            });
        }
    },

    mouseOut() {
        if (this.get('isSelecting')) {
            this.setProperties({
                isSelecting: false,
            });
        }
    },
});
