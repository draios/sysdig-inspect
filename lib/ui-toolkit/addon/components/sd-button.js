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

import { equal } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../templates/components/sd-button';

export default Component.extend({
    layout,
    tagName: 'button',
    classNames: ['sd-button'],
    classNameBindings: [
        'isSm:sd-button--sm',
        'isLg:sd-button--lg',
        'isWhite:sd-button--is-white',
        'isLight:sd-button--is-light',
        'isPrimary:sd-button--is-primary',
        'isActive:sd-button--is-active'
    ],
    attributeBindings: ['tabIndex', 'title', 'isDisabled:disabled'],

    tabIndex: 0,

    size: 'md',
    color: null,
    isActive: false,
    isDisabled: false,

    isSm: equal('size', 'sm').readOnly(),
    isLg: equal('size', 'lg').readOnly(),
    isWhite: equal('color', 'white').readOnly(),
    isLight: equal('color', 'light').readOnly(),
    isPrimary: equal('color', 'primary').readOnly(),

    iconSize: computed('size', function() {
        switch (this.get('size')) {
            case 'sm':
                return '16px';
            case 'lg':
                return '32px';
            default:
                return '24px';
        }
    }).readOnly(),
});
