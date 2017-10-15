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

import { readOnly, equal } from '@ember/object/computed';

import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/wsd-echo-op';

export default Component.extend({
    layout,
    classNames: ['wsd-echo-op'],
    classNameBindings: [
        'isRead:wsd-echo-op--is-read:wsd-echo-op--is-write',
        'isNotSearchMatch:wsd-echo-op--is-not-search-match'
    ],

    op: null,

    isNotSearchMatch: computed('op.meta.isMatch', function() {
        return this.get('op.meta.isMatch') === false;
    }).readOnly(),

    container: readOnly('op.d.0'),
    proc: readOnly('op.d.1'),
    fd: readOnly('op.d.2'),
    dir: readOnly('op.d.3'),
    length: readOnly('op.d.4'),
    output: readOnly('op.d.5'),

    isRead: equal('dir', '<').readOnly(),
});
