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

export default Ember.Service.extend({
    createSession() {
        return new SlowItDown();
    },
});

class SlowItDown {
    constructor() {
        this.queue = [];
        this.delay = 1;
    }

    doIt(fn) {
        this.queue.push(fn);

        if (this.queue.length === 1) {
            setTimeout(() => this.next(), this.delay);
        }
    }

    next() {
        const fn = this.queue.shift();

        Ember.run.schedule('actions', fn);

        if (this.queue.length > 0) {
            setTimeout(() => this.next(), this.delay);
        }
    }
}
