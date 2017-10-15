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

import { isEmpty, isNone } from '@ember/utils';

import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import layout from '../templates/components/sd-brush-overlay';

export default Component.extend({
    layout,
    classNames: ['sd-brush-overlay'],
    attributeBindings: ['pointer-events', 'fill', 'style', 'transform'],
    tagName: 'g',

    pointerEvents: 'all',
    fill: 'none',
    style: htmlSafe('-webkit-tap-highlight-color: rgba(0, 0, 0, 0);'),

    from: null,
    to: null,

    isSelecting: false,
    selectionRefPosition: null,

    transform: computed('translateX', 'translateY', function() {
        const x = this.get('translateX') || 0;
        const y = this.get('translateY') || 0;

        return `translate(${x}, ${y})`;
    }).readOnly(),

    xScale: computed('data', 'width', function() {
        const data = this.get('data');
        if (isEmpty(data)) {
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

    hasSelection: computed('from', 'to', function() {
        return isNone(this.get('from')) === false && isNone(this.get('to')) === false;
    }).readOnly(),

    selectionFromPosition: computed('hasSelection', 'xScale', function() {
        if (this.get('hasSelection')) {
            return this.get('xScale')(this.get('from'));
        } else {
            return null;
        }
    }).readOnly(),

    selectionToPosition: computed('hasSelection', 'xScale', function() {
        if (this.get('hasSelection')) {
            return this.get('xScale')(this.get('to'));
        } else {
            return null;
        }
    }).readOnly(),

    selectionWidth: computed('hasSelection', function() {
        if (this.get('hasSelection')) {
            return this.get('selectionToPosition') - this.get('selectionFromPosition');
        } else {
            return null;
        }
    }).readOnly(),

    mouseDown(e) {
        const selectionInfo = resetSelectionInfo(e.offsetX, this.get('xScale'));

        this.setProperties({
            isSelecting: true,
            selectionRefPosition: selectionInfo.refPosition,
        });

        this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
    },

    mouseMove(e) {
        if (this.get('isSelecting')) {
            const selectionInfo = updateSelectionInfo(e.offsetX, this.get('selectionRefPosition'), this.get('xScale'));

            this.setProperties({
                selectionRefPosition: selectionInfo.refPosition,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        }
    },

    mouseUp(e) {
        if (this.get('isSelecting')) {
            const selectionInfo = updateSelectionInfo(e.offsetX, this.get('selectionRefPosition'), this.get('xScale'));

            this.setProperties({
                isSelecting: false,
                selectionRefPosition: selectionInfo.refPosition,
            });

            this.sendAction('select', selectionInfo.fromBand, selectionInfo.toBand);
        }
    },

    mouseOut() {
        if (this.get('isSelecting')) {
            this.setProperties({
                isSelecting: false,
            });
        }
    },

    doubleClick() {
        this.setProperties({
            isSelecting: false,
        });

        this.sendAction('select', null, null);
    },
});

function resetSelectionInfo(cursorPosition, xScale) {
    return {
        refPosition: cursorPosition,
        fromPosition: cursorPosition,
        toPosition: cursorPosition,
        width: 0,
        fromBand: positionToBand(cursorPosition, xScale, true),
        toBand: positionToBand(cursorPosition, xScale, false),
    };
}

function updateSelectionInfo(cursorPosition, refPosition, xScale) {
    const from = cursorPosition < refPosition ? cursorPosition : refPosition;
    const to = cursorPosition < refPosition ? refPosition : cursorPosition;

    return {
        refPosition,
        fromPosition: from,
        toPosition: to,
        width: to - from,
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
