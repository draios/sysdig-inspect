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

import { equal } from '@ember/object/computed';

import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/wsd-metric-tile';

export default Component.extend({
    layout,
    classNames: ['wsd-metric-tile'],
    classNameBindings: [
        'isSelected:wsd-metric-tile--is-selected',
        'isTimelinePinned:wsd-metric-tile--is-pinned',
        'isNoteworthy:wsd-metric-tile--is-noteworthy',
        'isEmpty:wsd-metric-tile--is-empty'
    ],
    attributeBindings: ['tabIndex', 'style'],
    colorProvider: service('color-provider'),

    data: null,
    isSelected: false,
    isTimelinePinned: false,

    timeSeriesHeight: 44,
    timeSeriesWidth: 130,

    tabIndex: 0,
    buttonsColor: computed('isTimelinePinned', function() {
        return this.get('isTimelinePinned') ? 'white' : null;
    }).readOnly(),

    timeSeriesColor: computed('isTimelinePinned', function() {
        if (this.get('isTimelinePinned')) {
            return this.get('colorProvider').getColor('HISTOGRAM_COLUMN_DEFAULT_LIGHT');
        } else {
            return this.get('colorProvider').getColor('HISTOGRAM_COLUMN_LIGHT');
        }
    }).readOnly(),

    overlayStyle: computed('isTimelinePinned', function() {
        if (this.get('isTimelinePinned')) {
            const color = this.get('colorProvider').getColor(this.get('data.name'), 'OVERVIEW_METRIC');
            return htmlSafe(`border-color: ${color};`);
        } else {
            return null;
        }
    }).readOnly(),

    isNoteworthy: equal('data.noteworthy', true).readOnly(),
    isEmpty: equal('data.totalValue', 0).readOnly(),

    click() {
        this.sendAction('toggleTimeline');
    },

    doubleClick() {
        this.sendAction('drillDown');

        return false;
    },

    focusIn() {
        this.sendAction('select');
    },

    focusOut() {
        this.sendAction('deselect');
    },
});
