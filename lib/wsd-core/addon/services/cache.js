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

import Service from '@ember/service';

let stores;

export default Service.extend({
    init() {
        this._super(...arguments);

        this.reset();
    },

    reset() {
        stores = {};
    },

    store(id, data) {
        stores[id] = data;
    },

    find(id) {
        return stores[id];
    },

    delete(id) {
        delete stores[id];
    },
});
