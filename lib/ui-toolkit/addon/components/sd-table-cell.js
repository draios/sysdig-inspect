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

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table-cell'],
    classNameBindings: ['isRightAligned:sd-table-cell--is-right-aligned'],
    attributeBindings: ['title'],

    column: null,
    value: null,
    columnWidthUnit: 10,

    title: Ember.computed('column', 'value', function() {
        const columnName = this.get('column.name');
        const value = this.get('value');

        if (Ember.typeOf(value) === 'array') {
            return `${columnName}: ${value.mapBy('output').join('')}`;
        } else {
            return `${columnName}: ${value}`;
        }
    }).readOnly(),

    isRightAligned: Ember.computed.equal('column.alignment', 'RIGHT').readOnly(),
});
