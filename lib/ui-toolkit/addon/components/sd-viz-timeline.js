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

const DRAGGABLE_HANDLE_WIDTH = 12;
const TIME_LABELS_WIDTH = 80;
const TIME_DIFF_LABEL_WIDTH = 120;

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
    const roundFromIndex = Math.max(Math.min(shouldRound ? Math.round(fromIndex) : Math.trunc(fromIndex), domain.length - 2), 0);

    const toIndex = (toPosition - (po - pi / 2) * step) / (bandWidth + pi * step);
    const roundToIndex = Math.min(Math.max(Math.round(toIndex) - 1, roundFromIndex + 1), domain.length - 1);

    return {
        from: domain[roundFromIndex],
        to: domain[roundToIndex],
    };
}
