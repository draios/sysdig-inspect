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

import Ember from 'ember';
import layout from '../templates/components/sd-table-cell';

const COLUMN_WIDTH_UNIT = 10;

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table-cell'],
    classNameBindings: ['isRightAligned:sd-table-cell--is-right-aligned'],
    attributeBindings: ['style'],

    column: null,
    value: null,

    style: Ember.computed('column', function() {
        const columnSize = this.get('column.size');

        if (Ember.isNone(columnSize) === false) {
            const width = COLUMN_WIDTH_UNIT * columnSize;
            return Ember.String.htmlSafe(`flex: none; width: ${width}px;`);
        } else {
            return Ember.String.htmlSafe('flex: none; min-width: 200px; width: 30vw; max-width: 1000px;');
        }
    }).readOnly(),

    isRightAligned: Ember.computed.equal('column.alignment', 'RIGHT').readOnly(),
});
