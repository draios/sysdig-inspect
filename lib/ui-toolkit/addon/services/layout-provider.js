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

/* global window */

import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
    init() {
        window.addEventListener('resize', () => {
            Ember.run.debounce(this, triggerEvent, 20);
        });
    },

    onLayoutChanged(target, fn) {
        this.on('layoutChanged', target, fn);
    },

    offLayoutChanged(target, fn) {
        this.off('layoutChanged', target, fn);
    },

    didChange() {
        Ember.run.scheduleOnce('afterRender', triggerEvent.bind(this));
    },

    whenSettled(fn) {
        Ember.run.schedule('afterRender', fn);
    },
});

function triggerEvent() {
    this.trigger('layoutChanged');
}
