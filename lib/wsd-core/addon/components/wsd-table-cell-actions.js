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

import { htmlSafe } from '@ember/string';

import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/wsd-table-cell-actions';

export default Component.extend({
    layout,
    classNames: ['wsd-table-cell-actions'],
    attributeBindings: ['style'],

    rowWidth: 0,
    rowScrollX: 0,

    style: computed('rowWidth', 'rowScrollX', function() {
        const offset = this.get('rowWidth') + this.get('rowScrollX');
        return htmlSafe(`left: ${offset - (84 + 4)}px;`);
    }).readOnly(),
});
