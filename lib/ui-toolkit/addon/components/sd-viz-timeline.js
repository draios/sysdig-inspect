/* global d3 */

import Ember from 'ember';
import layout from '../templates/components/sd-viz-timeline';

const DRAGGABLE_HANDLE_WIDTH = 12;

export default Ember.Component.extend({
    layout,
    classNames: ['sd-viz-timeline'],

    from: null,
    to: null,
    selectedFrom: null,
    selectedTo: null,
    timelinesWidth: null,

    xScale: Ember.computed('timeline', 'timelinesWidth', function() {
        if (this.get('timeline')) {
            return d3.scaleBand()
                .domain(this.get('timeline'))
                .range([0, this.get('timelinesWidth')])
                .paddingInner([0.2])
                .paddingOuter([0])
            ;
        } else {
            return null;
        }
    }).readOnly(),

    adjustTimestamp(timestamp, round) {
        let bandPosition = this.get('xScale')(timestamp);
        if (bandPosition !== undefined) {
            return bandPosition;
        } else {
            // binary search  would be ideal
            const timeline = this.get('timeline');
            let i;
            const iz = timeline.length;

            if (round) {
                for (i = 0; i < iz && timeline[i] < timestamp; i++) {
                    // noop
                }

                return this.get('xScale')(timeline[i - 1]);
            } else {
                for (i = iz - 1; i >= 0 && timeline[i] > timestamp; i--) {
                    // noop
                }

                return this.get('xScale')(timeline[i + 1]);
            }
        }
    },

    leftAreaSize: Ember.computed('xScale', 'selectedFrom', function() {
        if (this.get('xScale')) {
            const selectedFromPosition = this.adjustTimestamp(this.get('selectedFrom'), true);
            return Math.round(selectedFromPosition) + DRAGGABLE_HANDLE_WIDTH;
        } else {
            return DRAGGABLE_HANDLE_WIDTH;
        }
    }).readOnly(),
    leftAreaStyle: Ember.computed('leftAreaSize', function() {
        return Ember.String.htmlSafe(`width: ${this.get('leftAreaSize')}px;`);
    }).readOnly(),
    rightAreaSize: Ember.computed('xScale', 'selectedTo', function() {
        if (this.get('xScale')) {
            const toPosition = this.adjustTimestamp(this.get('to'), false);
            const selectedToPosition = this.adjustTimestamp(this.get('selectedTo'), false);
            return Math.round(toPosition - selectedToPosition) + DRAGGABLE_HANDLE_WIDTH;
        } else {
            return DRAGGABLE_HANDLE_WIDTH;
        }
    }).readOnly(),
    rightAreaStyle: Ember.computed('rightAreaSize', function() {
        return Ember.String.htmlSafe(`width: ${this.get('rightAreaSize')}px;`);
    }).readOnly(),

    isDragging: false,
    dragStartPosition: null,

    calculateCursorPosition(position) {
        return position - this.get('element').getBoundingClientRect().x - DRAGGABLE_HANDLE_WIDTH;
    },

    mouseDown(e) {
        const selectionInfo = resetSelectionInfo(this.calculateCursorPosition(e.clientX), this.get('xScale'));

        this.setProperties({
            isDragging: true,
            dragStartPosition: selectionInfo.dragStartPosition,
        });

        this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);

        return false;
    },

    mouseMove(e) {
        if (this.get('isDragging')) {
            const position = this.calculateCursorPosition(e.clientX);
            const selectionInfo = updateSelectionInfo(position, this.get('dragStartPosition'), this.get('xScale'));
            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);

            return false;
        }
    },

    mouseUp(e) {
        if (this.get('isDragging')) {
            const position = this.calculateCursorPosition(e.clientX);
            const selectionInfo = updateSelectionInfo(position, this.get('dragStartPosition'), this.get('xScale'));

            this.set('isDragging', false);
            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);

            return false;
        }
    },

    mouseLeave() {
        if (this.get('isDragging')) {
            this.set('isDragging', false);

            return false;
        }
    },

    doubleClick() {
        this.set('isDragging', false);
        this.sendAction('select', null, null);
        return false;
    },

    actions: {
        dragLeft(position) {
            const selectionInfo = updateSelectionInfo(
                this.calculateCursorPosition(position),
                this.get('xScale')(this.get('selectedTo')),
                this.get('xScale')
            );

            this.setProperties({
                isDragging: true,
                dragStartPosition: selectionInfo.dragStartPosition,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        },
        dragRight(position) {
            const selectionInfo = updateSelectionInfo(
                this.calculateCursorPosition(position),
                this.get('xScale')(this.get('selectedFrom')),
                this.get('xScale')
            );

            this.setProperties({
                isDragging: true,
                dragStartPosition: selectionInfo.dragStartPosition,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        },
    },
});

function resetSelectionInfo(cursorPosition, xScale) {
    return {
        dragStartPosition: cursorPosition,
        fromBand: positionToBand(cursorPosition, xScale, true),
        toBand: positionToBand(cursorPosition, xScale, false),
    };
}

function updateSelectionInfo(cursorPosition, dragStartPosition, xScale) {
    const from = cursorPosition < dragStartPosition ? cursorPosition : dragStartPosition;
    const to = cursorPosition < dragStartPosition ? dragStartPosition : cursorPosition;

    return {
        dragStartPosition,
        fromBand: positionToBand(from, xScale, true),
        toBand: positionToBand(to, xScale, false),
    };
}

function positionToBand(position, xScale, shouldTruncate) {
    const po = xScale.paddingOuter();
    const pi = xScale.paddingInner();
    const bandWidth = xScale.bandwidth();
    const step = xScale.step();
    const domain = xScale.domain();

    const index = (position - (po - pi / 2) * step) / (bandWidth + pi * step);
    const roundIndex = shouldTruncate ? Math.trunc(index) : Math.ceil(index);

    if (roundIndex < domain.length) {
        return domain[roundIndex];
    } else {
        return domain[domain.length - 1];
    }
}
