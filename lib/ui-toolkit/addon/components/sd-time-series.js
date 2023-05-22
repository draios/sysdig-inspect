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
import layout from '../templates/components/sd-time-series';

export default Component.extend({
    layout,
    tagName: 'svg',
    classNames: ['sd-time-series'],
    classNameBindings: ['themeClassName', 'isSelected:sd-time-series--is-selected'],
    attributeBindings: ['width', 'height'],

    data: null,
    isSelected: false,
    width: 100,
    height: 50,
    timestampProp: 'x',
    valueProp: 'y',
    columnColor: null,

    theme: null,
    themeClassName: computed('theme', function() {
        if (this.get('theme')) {
            return `sd-time-series--theme-${this.get('theme')}`;
        } else {
            return null;
        }
    }).readOnly(),

    canBeRendered: computed('width', 'height', function() {
        return this.get('width') > 0 && this.get('height') > 0;
    }).readOnly(),
});
