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
import layout from '../templates/components/sd-viz-timeline';

const DRAGGABLE_HANDLE_WIDTH = 10;
const TIME_LABELS_WIDTH = 80;
const TIME_DIFF_LABEL_WIDTH = 160;

export default Ember.Component.extend({
    layout,
    classNames: ['sd-viz-timeline'],

    captureInfo: null,
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
            const selectedFromPosition = getLeftPosition(this.get('selectedFrom'), this.get('xScale'), this.get('timeline'));
            return selectedFromPosition + DRAGGABLE_HANDLE_WIDTH;
        } else {
            return DRAGGABLE_HANDLE_WIDTH;
        }
    }).readOnly(),
    leftAreaStyle: Ember.computed('leftAreaSize', function() {
        return Ember.String.htmlSafe(`width: ${this.get('leftAreaSize')}px;`);
    }).readOnly(),
    rightAreaSize: Ember.computed('xScale', 'selectedTo', function() {
        if (this.get('xScale')) {
            const toPosition = getRightPosition(this.get('to'), this.get('xScale'), this.get('timeline'));
            const selectedToPosition = getRightPosition(this.get('selectedTo'), this.get('xScale'), this.get('timeline'));

            if (toPosition === selectedToPosition) {
                return DRAGGABLE_HANDLE_WIDTH;
            } else {
                return toPosition - selectedToPosition + DRAGGABLE_HANDLE_WIDTH + (this.get('xScale').paddingInner() + this.get('xScale').paddingOuter()) * this.get('xScale').bandwidth();
            }
        } else {
            return DRAGGABLE_HANDLE_WIDTH;
        }
    }).readOnly(),
    rightAreaStyle: Ember.computed('rightAreaSize', function() {
        return Ember.String.htmlSafe(`width: ${this.get('rightAreaSize')}px;`);
    }).readOnly(),

    isTimeLabelInternal: Ember.computed('timelinesWidth', 'leftAreaSize', 'rightAreaSize', function() {
        const selectedAreaWidth = this.get('timelinesWidth') - (this.get('leftAreaSize') - DRAGGABLE_HANDLE_WIDTH) - (this.get('rightAreaSize') - DRAGGABLE_HANDLE_WIDTH);
        return selectedAreaWidth > TIME_LABELS_WIDTH * 2 + TIME_DIFF_LABEL_WIDTH;
    }).readOnly(),

    isTimeDiffLabelOnTop: Ember.computed('timelinesWidth', 'leftAreaSize', 'rightAreaSize', function() {
        const selectedAreaWidth = this.get('timelinesWidth') - (this.get('leftAreaSize') - DRAGGABLE_HANDLE_WIDTH) - (this.get('rightAreaSize') - DRAGGABLE_HANDLE_WIDTH);
        return selectedAreaWidth < TIME_DIFF_LABEL_WIDTH;
    }).readOnly(),

    selectedRelativeFrom: Ember.computed('from', 'selectedFrom', function() {
        const reference = this.get('from');
        const target = this.get('selectedFrom');

        // NOTE: this timestamps are stored as strings, for the nanosecond precision
        let i;
        for (i = target.length - 1; i >= 0 && reference.indexOf(target.substring(0, i)); i--) {
            // noop
        }

        const referenceNs = Number(reference.substring(i));
        const targetNs = Number(target.substring(i));
        const diffNs = targetNs - referenceNs;

        return diffNs;
    }).readOnly(),

    selectedRelativeTo: Ember.computed('from', 'selectedTo', function() {
        const reference = this.get('from');
        const target = this.get('selectedTo');

        // NOTE: this timestamps are stored as strings, for the nanosecond precision
        let i;
        for (i = target.length - 1; i >= 0 && reference.indexOf(target.substring(0, i)); i--) {
            // noop
        }

        const referenceNs = Number(reference.substring(i));
        const targetNs = Number(target.substring(i));
        const diffNs = targetNs - referenceNs;

        return diffNs;
    }).readOnly(),

    selectedDiff: Ember.computed('selectedRelativeFrom', 'selectedRelativeTo', function() {
        return this.get('selectedRelativeTo') - this.get('selectedRelativeFrom');
    }).readOnly(),

    isDragging: false,
    holdPosition: null,
    dragOffset: null,

    mouseDown(e) {
        const selectionInfo = createSelectionArea(calculateCursorPosition(e.clientX, this.get('element')), this.get('xScale'), this.get('captureInfo.to'));

        this.setProperties({
            isDragging: true,
            holdPosition: selectionInfo.holdPosition,
            dragOffset: 0,
        });

        this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);

        return false;
    },

    mouseMove(e) {
        if (this.get('isDragging')) {
            const position = calculateCursorPosition(e.clientX, this.get('element'));
            const selectionInfo = updateSelectedArea(
                position + this.get('dragOffset'),
                this.get('holdPosition'),
                this.get('xScale'),
                this.get('captureInfo.to')
            );
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
            const offset = calculateCursorPosition(position, this.get('element'));
            const leftHandleOffset = this.get('leftAreaSize') - DRAGGABLE_HANDLE_WIDTH;
            const rightHandleOffset = this.get('timelinesWidth') - this.get('rightAreaSize') + DRAGGABLE_HANDLE_WIDTH;
            const dragOffset = leftHandleOffset - offset;
            const selectionInfo = updateSelectedArea(
                offset + dragOffset,
                rightHandleOffset,
                this.get('xScale'),
                this.get('captureInfo.to')
            );

            this.setProperties({
                isDragging: true,
                holdPosition: selectionInfo.holdPosition,
                dragOffset: dragOffset,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        },
        dragRight(position) {
            const offset = calculateCursorPosition(position, this.get('element'));
            const leftHandleOffset = this.get('leftAreaSize') - DRAGGABLE_HANDLE_WIDTH;
            const rightHandleOffset = this.get('timelinesWidth') - this.get('rightAreaSize') + DRAGGABLE_HANDLE_WIDTH;
            const dragOffset = rightHandleOffset - offset;
            const selectionInfo = updateSelectedArea(
                offset + dragOffset,
                leftHandleOffset,
                this.get('xScale'),
                this.get('captureInfo.to')
            );

            this.setProperties({
                isDragging: true,
                holdPosition: selectionInfo.holdPosition,
                dragOffset: dragOffset,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        },
    },
});

function calculateCursorPosition(position, element) {
    return position - element.getBoundingClientRect().left - DRAGGABLE_HANDLE_WIDTH;
}

function getLeftPosition(timestamp, xScale, timeline) {
    let bandPosition = xScale(timestamp);
    if (bandPosition !== undefined) {
        return bandPosition;
    } else {
        // binary search  would be ideal
        let i;
        const iz = timeline.length;
        for (i = 0; i < iz && timeline[i] < timestamp; i++) {
            // noop
        }

        return xScale(timeline[i - 1]);
    }
}

function getRightPosition(timestamp, xScale, timeline) {
    let bandPosition = xScale(timestamp);
    if (bandPosition !== undefined) {
        return bandPosition;
    } else {
        // binary search  would be ideal
        let i;
        const iz = timeline.length;

        for (i = iz - 1; i >= 0 && timeline[i] > timestamp; i--) {
            // noop
        }

        if (i < timeline.length - 1) {
            return xScale(timeline[i + 1]);
        } else {
            return xScale(timeline[i]) + xScale.bandwidth();
        }
    }
}

function createSelectionArea(cursorPosition, xScale, captureTo) {
    const band = positionToBand(cursorPosition, cursorPosition, xScale, captureTo);

    return {
        holdPosition: cursorPosition,
        fromBand: band.from,
        toBand: band.to,
    };
}

function updateSelectedArea(movingPosition, holdPosition, xScale, captureTo) {
    const band = positionToBand(
        Math.min(movingPosition, holdPosition),
        Math.max(movingPosition, holdPosition),
        xScale,
        captureTo
    );

    return {
        holdPosition,
        fromBand: band.from,
        toBand: band.to,
    };
}

function positionToBand(fromPosition, toPosition, xScale, captureTo) {
    const po = xScale.paddingOuter();
    const pi = xScale.paddingInner();
    const bandWidth = xScale.bandwidth();
    const step = xScale.step();
    const domain = xScale.domain();

    const fromIndex = (fromPosition - (po - pi / 2) * step) / (bandWidth + pi * step);
    const roundFromIndex = Math.trunc(fromIndex);

    const toIndex = (toPosition - (po - pi / 2) * step) / (bandWidth + pi * step);
    const roundToIndex = Math.trunc(toIndex);

    return {
        from: domain[roundFromIndex],
        to: roundToIndex < domain.length - 1 ? domain[roundToIndex + 1] : captureTo,
    };
}
