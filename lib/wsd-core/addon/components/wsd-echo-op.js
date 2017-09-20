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
import layout from '../templates/components/wsd-echo-op';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-echo-op'],
    classNameBindings: [
        'isRead:wsd-echo-op--is-read:wsd-echo-op--is-write',
        'isNotSearchMatch:wsd-echo-op--is-not-search-match'
    ],

    op: null,

    isNotSearchMatch: Ember.computed('op.meta.isMatch', function() {
        return this.get('op.meta.isMatch') === false;
    }).readOnly(),

    container: Ember.computed.readOnly('op.d.0'),
    proc: Ember.computed.readOnly('op.d.1'),
    fd: Ember.computed.readOnly('op.d.2'),
    dir: Ember.computed.readOnly('op.d.3'),
    length: Ember.computed.readOnly('op.d.4'),
    output: Ember.computed.readOnly('op.d.5'),

    isRead: Ember.computed.equal('dir', '<').readOnly(),
});
