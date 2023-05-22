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

import { typeOf } from '@ember/utils';

import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/sd-tokenized-output';

export default Component.extend({
    layout,
    tagName: 'span',
    classNames: ['sd-tokenized-output'],

    output: null,
    isPre: false,

    isTokenized: computed('output', function() {
        return typeOf(this.get('output')) === 'array';
    }).readOnly(),
});
