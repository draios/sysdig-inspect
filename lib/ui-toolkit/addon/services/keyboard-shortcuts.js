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

/* global Mousetrap */

import Ember from 'ember';

export default Ember.Service.extend({
    userTracking: Ember.inject.service('user-tracking'),

    categories: null,
    list: null,

    setShortcuts(categories, list) {
        this.setProperties({
            categories,
            list,
        });
    },

    defineCategory() {
        return new ShortcutCategory(...arguments);
    },

    defineShortcut() {
        return new ShortcutConfiguration(...arguments);
    },

    bind(id, fn, component = null) {
        const configuration = this.get('list').findBy('id', id);

        if (configuration) {
            const targetElement = component ? component.get('element') : null;
            const mousetrap = targetElement ? Mousetrap.call(Mousetrap, targetElement) : Mousetrap;
            mousetrap.bind(configuration.keys, () => {
                this.get('userTracking').action(this.get('userTracking').ACTIONS.SHORTCUT, {
                    id,
                    category: configuration.category,
                    name: configuration.name,
                    keys: configuration.keys.join(', '),
                });

                fn();
            });
        }
    },

    unbind(id, component = null) {
        const configuration = this.get('list').findBy('id', id);

        if (configuration) {
            const targetElement = component ? component.get('element') : null;
            const mousetrap = targetElement ? Mousetrap.call(Mousetrap, targetElement) : Mousetrap;
            mousetrap.unbind(configuration.keys);
        }
    },
});

class ShortcutConfiguration {
    constructor(id, category, name, keys, isVisibleInHelp = true) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.keys = keys;
        this.key = keys[0];
        this.isVisibleInHelp = isVisibleInHelp;
    }
}

class ShortcutCategory {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.shortcuts = [];
    }
}