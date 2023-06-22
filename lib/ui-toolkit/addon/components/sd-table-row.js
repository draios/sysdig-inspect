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

import { computed } from '@ember/object';

import Component from '@ember/component';
import layout from '../templates/components/sd-table-row';

export default Component.extend({
    layout,
    classNames: ['sd-table-row'],
    classNameBindings: [
        'isSelected:sd-table-row--is-selected',
        'isNotSearchMatch:sd-table-row--is-not-search-match'
    ],

    row: null,
    isMouseOver: false,
    isSelected: false,
    scrollX: 0,
    width: 0,

    areActionsVisible: computed('isMouseOver', 'isSelected', function() {
        return this.get('row.rowActionsComponent') && (this.get('isMouseOver') || this.get('isSelected'));
    }).readOnly(),

    rowConfiguration: computed('row', 'isMouseOver', function() {
        return {
            configuration: this.get('row'),
            isMouseOver: this.get('isMouseOver'),
        };
    }).readOnly(),

    isNotSearchMatch: computed('row.meta.isMatch', function() {
        return this.get('row.meta.isMatch') === false;
    }).readOnly(),

    mouseEnter() {
        this.set('isMouseOver', true);
    },

    mouseLeave() {
        this.set('isMouseOver', false);
    },

    click() {
        this.sendAction('select');
    },

    doubleClick() {
        this.sendAction('activate');
    },
});
