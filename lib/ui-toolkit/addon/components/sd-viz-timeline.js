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

import { htmlSafe } from '@ember/template';

import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/sd-viz-timeline';
import nanoseconds from '../utils/nanoseconds';

const DRAGGABLE_HANDLE_WIDTH = 10;
const TIME_CHEVRON_WIDTH = 8;
const TIME_LABELS_WIDTH = 74 + TIME_CHEVRON_WIDTH;
const TIME_DIFF_LABEL_WIDTH = 132 + TIME_CHEVRON_WIDTH * 2;

export default Component.extend({
    layout,
    classNames: ['sd-viz-timeline'],
    classNameBindings: ['isMouseOver:sd-viz-timeline--is-mouse-over'],

    captureInfo: null,
    from: null,
    to: null,
    selectedFrom: null,
    selectedTo: null,
    timelinesWidth: null,
    isMouseOver: false,
    hoverTimestamp: null,

    xScale: computed('timeline', 'timelinesWidth', function() {
        if (this.get('timeline')) {
            return d3.scaleBand()
                .domain(this.get('timeline'))
                .range([0, this.get('timelinesWidth')])
            ;
        } else {
            return null;
        }
    }).readOnly(),

    hoverMarkerStyle: computed('xScale', 'hoverTimestamp', function() {
        const hoverTimestamp = this.get('hoverTimestamp');

        if (isNone(hoverTimestamp) === false) {
            const xScale = this.get('xScale');
            return htmlSafe(`width: ${xScale.bandwidth()}px; left: ${xScale(hoverTimestamp) + DRAGGABLE_HANDLE_WIDTH}px;`);
        } else {
            return null;
        }
    }).readOnly(),

    leftAreaSize: computed('xScale', 'selectedFrom', function() {
        const xScale = this.get('xScale');
        if (xScale) {
            return getLeftPosition(this.get('selectedFrom'), xScale, this.get('timeline'));
        } else {
            return 0;
        }
    }).readOnly(),
    leftAreaStyle: computed('leftAreaSize', function() {
        return htmlSafe(`width: ${this.get('leftAreaSize') + DRAGGABLE_HANDLE_WIDTH}px;`);
    }).readOnly(),
    rightAreaSize: computed('xScale', 'selectedTo', function() {
        const xScale = this.get('xScale');
        if (xScale) {
            const toPosition = getRightPosition(this.get('to'), xScale, this.get('timeline'));
            const selectedToPosition = getRightPosition(this.get('selectedTo'), xScale, this.get('timeline'));

            return toPosition - selectedToPosition;
        } else {
            return 0;
        }
    }).readOnly(),
    rightAreaStyle: computed('rightAreaSize', function() {
        return htmlSafe(`width: ${this.get('rightAreaSize') + DRAGGABLE_HANDLE_WIDTH}px;`);
    }).readOnly(),

    isTimeLabelInternal: computed('timelinesWidth', 'leftAreaSize', 'rightAreaSize', function() {
        const selectedAreaWidth = this.get('timelinesWidth') - this.get('leftAreaSize') - this.get('rightAreaSize');
        return selectedAreaWidth > TIME_LABELS_WIDTH * 2 + TIME_DIFF_LABEL_WIDTH;
    }).readOnly(),

    isTimeDiffLabelOnTop: computed('timelinesWidth', 'leftAreaSize', 'rightAreaSize', function() {
        const selectedAreaWidth = this.get('timelinesWidth') - this.get('leftAreaSize') - this.get('rightAreaSize');
        return selectedAreaWidth < TIME_DIFF_LABEL_WIDTH;
    }).readOnly(),

    selectedRelativeFrom: computed('from', 'selectedFrom', function() {
        return nanoseconds(this.get('selectedFrom'))
            .diff(nanoseconds(this.get('from')))
            .toNumber()
        ;
    }).readOnly(),

    selectedRelativeTo: computed('from', 'selectedTo', function() {
        return nanoseconds(this.get('selectedTo'))
            .diff(nanoseconds(this.get('from')))
            .toNumber()
        ;
    }).readOnly(),

    selectedDiff: computed('selectedRelativeFrom', 'selectedRelativeTo', function() {
        return this.get('selectedRelativeTo') - this.get('selectedRelativeFrom');
    }).readOnly(),

    isDragging: false,
    isDraggingLeftHandle: undefined,
    holdPosition: null,
    dragOffset: null,

    mouseDown(e) {
        const selectionInfo = createSelectionArea(calculateCursorPosition(e.clientX, this.get('element')), this.get('xScale'), this.get('captureInfo.to'));

        this.setProperties({
            isDragging: true,
            isDraggingLeftHandle: undefined, // what's dragging will be defined on first move
            holdPosition: selectionInfo.holdPosition,
            dragOffset: 0,
        });

        this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        this.sendAction('hover', null);

        return false;
    },

    mouseMove(e) {
        if (this.get('isDragging')) {
            // You are moving the mouse dragging one of the handles
            const position = calculateCursorPosition(e.clientX, this.get('element'));
            const selectionInfo = updateSelectedArea(
                position + this.get('dragOffset'),
                this.get('holdPosition'),
                this.get('xScale'),
                this.get('captureInfo.to')
            );

            let from;
            let to;
            if (this.get('isDraggingLeftHandle') === undefined) {
                //
                // You just started a new selection by clicking on the chart
                //
                // - You're going to drag the left handle if you move the mouse towards the left
                // - you're going to drag the right handle if you move the mouse towards the right
                //
                if (selectionInfo.fromBand < selectionInfo.toBand) {
                    this.set('isDraggingLeftHandle', position < this.get('holdPosition'));
                }
            }

            // Change the moving handle, keep the other one persistent
            if (this.get('isDraggingLeftHandle')) {
                from = selectionInfo.fromBand;
                to = this.get('selectedTo');
            } else {
                from = this.get('selectedFrom');
                to = selectionInfo.toBand;
            }

            if (from < to) {
                this.sendAction('select', from, to);
            }

            return false;
        } else {
            const selectionInfo = createSelectionArea(calculateCursorPosition(e.clientX, this.get('element')), this.get('xScale'), this.get('captureInfo.to'));
            this.sendAction('hover', selectionInfo.fromBand);

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
        this.sendAction('select', this.get('from'), this.get('to'));

        return false;
    },

    actions: {
        dragLeft(position) {
            const offset = calculateCursorPosition(position, this.get('element'));
            const rightHandleOffset = getRightPosition(this.get('selectedTo'), this.get('xScale'), this.get('timeline'));
            const dragOffset = this.get('leftAreaSize') - offset;
            const selectionInfo = updateSelectedArea(
                offset + dragOffset,
                rightHandleOffset,
                this.get('xScale'),
                this.get('captureInfo.to')
            );

            this.setProperties({
                isDragging: true,
                isDraggingLeftHandle: true,
                holdPosition: selectionInfo.holdPosition,
                dragOffset,
            });

            this.sendAction('select', selectionInfo.fromBand, this.get('selectedTo'));
            this.sendAction('hover', null);
        },
        dragRight(position) {
            const offset = calculateCursorPosition(position, this.get('element'));
            const rightHandleOffset = getRightPosition(this.get('selectedTo'), this.get('xScale'), this.get('timeline'));
            const dragOffset = rightHandleOffset - offset;
            const selectionInfo = updateSelectedArea(
                offset + dragOffset,
                this.get('leftAreaSize'),
                this.get('xScale'),
                this.get('captureInfo.to')
            );

            this.setProperties({
                isDragging: true,
                isDraggingLeftHandle: false,
                holdPosition: selectionInfo.holdPosition,
                dragOffset,
            });

            this.sendAction('select', this.get('selectedFrom'), selectionInfo.toBand);
            this.sendAction('hover', null);
        },
    },
});

function calculateCursorPosition(position, element) {
    return position - element.getBoundingClientRect().left - DRAGGABLE_HANDLE_WIDTH;
}

function getLeftPosition(timestamp, xScale, timeline) {
    let bandPosition = xScale(timestamp);
    if (bandPosition !== undefined) {
        //
        // if timestamp is in the scale, then return the position of the left side of the band
        //
        return bandPosition;
    } else {
        //
        // otherwise, find the first band that starts before timestamp (from left)
        //
        let i;
        const iz = timeline.length;
        // binary search  would be ideal
        for (i = 0; i < iz && timeline[i] < timestamp; i++) {
            // noop
        }

        return xScale(timeline[i - 1]);
    }
}

function getRightPosition(timestamp, xScale, timeline) {
    let bandPosition = xScale(timestamp);
    if (bandPosition !== undefined) {
        //
        // if timestamp is in the scale, then return the position of the left side of the band
        //
        return bandPosition;
    } else {
        //
        // otherwise, find the last band that starts after timestamp (from right)
        //
        let i;
        const iz = timeline.length;
        // binary search  would be ideal
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
    const toAdjustment = toIndex === roundToIndex ? 0 : 1;

    return {
        from: roundFromIndex >= 0 ? domain[roundFromIndex] : domain[0],
        to: roundToIndex < domain.length - 1 ? domain[roundToIndex + toAdjustment] : captureTo,
    };
}
