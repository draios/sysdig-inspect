/* global d3 */

import Ember from 'ember';
import layout from '../templates/components/brush-overlay';

export default Ember.Component.extend({
    layout,
    classNames: 'brush',
    attributeBindings: ['pointer-events', 'fill', 'style'],
    tagName: 'g',

    pointerEvents: 'all',
    fill: 'none',
    style: Ember.String.htmlSafe('-webkit-tap-highlight-color: rgba(0, 0, 0, 0);'),

    isSvg: false,

    isSelecting: false,
    selection: null,

    xScale: Ember.computed('data', 'width', function() {
        const data = this.get('data');
        if (Ember.isEmpty(data)) {
            return null;
        }

        const xProp = this.get('categoryProp');

        return d3.scaleBand()
            .domain(data.map((d) => d[xProp]))
            .range([0, this.get('width')])
            .paddingInner([0.2])
            .paddingOuter([0.5])
        ;
    }).readOnly(),

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
