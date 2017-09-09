/* global d3 */

import Ember from 'ember';
import layout from '../templates/components/sd-viz-timeline';

const DRAGGABLE_HANDLE_WIDTH = 12;
const TIME_LABELS_WIDTH = 110;

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

    leftAreaSize: Ember.computed('xScale', 'selectedFrom', function() {
        if (this.get('xScale')) {
            const selectedFromPosition = adjustTimestamp(this.get('selectedFrom'), true, this.get('xScale'), this.get('timeline'));
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
            const toPosition = adjustTimestamp(this.get('to'), false, this.get('xScale'), this.get('timeline'));
            const selectedToPosition = adjustTimestamp(this.get('selectedTo'), false, this.get('xScale'), this.get('timeline'));
            return Math.round(toPosition - selectedToPosition) + DRAGGABLE_HANDLE_WIDTH;
        } else {
            return DRAGGABLE_HANDLE_WIDTH;
        }
    }).readOnly(),
    rightAreaStyle: Ember.computed('rightAreaSize', function() {
        return Ember.String.htmlSafe(`width: ${this.get('rightAreaSize')}px;`);
    }).readOnly(),

    isTimeLabelInternal: Ember.computed('timelinesWidth', 'leftAreaSize', 'rightAreaSize', function() {
        const selectedAreaWidth = this.get('timelinesWidth') - (this.get('leftAreaSize') - DRAGGABLE_HANDLE_WIDTH) - (this.get('rightAreaSize') - DRAGGABLE_HANDLE_WIDTH);
        return selectedAreaWidth > TIME_LABELS_WIDTH * 2;
    }).readOnly(),

    isDragging: false,
    holdPosition: null,

    mouseDown(e) {
        const selectionInfo = createSelectionArea(calculateCursorPosition(e.clientX, this.get('element')), this.get('xScale'));

        this.setProperties({
            isDragging: true,
            holdPosition: selectionInfo.holdPosition,
        });

        this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);

        return false;
    },

    mouseMove(e) {
        if (this.get('isDragging')) {
            const position = calculateCursorPosition(e.clientX, this.get('element'));
            const selectionInfo = updateSelectedArea(position, this.get('holdPosition'), this.get('xScale'));
            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);

            return false;
        }
    },

    mouseUp() {
        if (this.get('isDragging')) {
            this.set('isDragging', false);
        }
    },

    mouseLeave() {
        if (this.get('isDragging')) {
            this.set('isDragging', false);
        }
    },

    doubleClick() {
        this.set('isDragging', false);
        this.sendAction('select', null, null);

        return false;
    },

    actions: {
        dragLeft(position) {
            const selectionInfo = updateSelectedArea(
                calculateCursorPosition(position, this.get('element')),
                this.get('timelinesWidth') - this.get('rightAreaSize') + DRAGGABLE_HANDLE_WIDTH,
                this.get('xScale')
            );

            this.setProperties({
                isDragging: true,
                holdPosition: selectionInfo.holdPosition,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        },
        dragRight(position) {
            const selectionInfo = updateSelectedArea(
                calculateCursorPosition(position, this.get('element')),
                this.get('leftAreaSize') - DRAGGABLE_HANDLE_WIDTH,
                this.get('xScale')
            );

            this.setProperties({
                isDragging: true,
                holdPosition: selectionInfo.holdPosition,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        },
    },
});

function calculateCursorPosition(position, element) {
    return position - element.getBoundingClientRect().left - DRAGGABLE_HANDLE_WIDTH;
}

function adjustTimestamp(timestamp, isLeftSide, xScale, timeline) {
    let bandPosition = xScale(timestamp);
    if (bandPosition !== undefined) {
        return bandPosition;
    } else {
        // binary search  would be ideal
        let i;
        const iz = timeline.length;

        if (isLeftSide) {
            for (i = 0; i < iz && timeline[i] < timestamp; i++) {
                // noop
            }

            return xScale(timeline[i - 1]);
        } else {
            for (i = iz - 1; i >= 0 && timeline[i] > timestamp; i--) {
                // noop
            }

            return xScale(timeline[i + 1]);
        }
    }
}

function createSelectionArea(cursorPosition, xScale) {
    const band = positionToBand(cursorPosition, cursorPosition, xScale, false);

    return {
        holdPosition: cursorPosition,
        fromBand: band.from,
        toBand: band.to,
    };
}

function updateSelectedArea(movingPosition, holdPosition, xScale) {
    const band = positionToBand(
        Math.min(movingPosition, holdPosition),
        Math.max(movingPosition, holdPosition),
        xScale,
        true
    );

    return {
        holdPosition,
        fromBand: band.from,
        toBand: band.to,
    };
}

function positionToBand(fromPosition, toPosition, xScale, shouldRound) {
    const po = xScale.paddingOuter();
    const pi = xScale.paddingInner();
    const bandWidth = xScale.bandwidth();
    const step = xScale.step();
    const domain = xScale.domain();

    const fromIndex = (fromPosition - (po - pi / 2) * step) / (bandWidth + pi * step);
    const roundFromIndex = Math.min(shouldRound ? Math.round(fromIndex) : Math.trunc(fromIndex), domain.length - 2);

    const toIndex = (toPosition - (po - pi / 2) * step) / (bandWidth + pi * step);
    const roundToIndex = Math.min(Math.max(Math.round(toIndex) - 1, roundFromIndex + 1), domain.length - 1);

    return {
        from: domain[roundFromIndex],
        to: domain[roundToIndex],
    };
}
