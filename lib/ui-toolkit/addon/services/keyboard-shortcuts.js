/* global Mousetrap */

import Ember from 'ember';

export default Ember.Service.extend({
    categories: null,
    list: null,

    setShortcuts(categories, list) {
        this.setProperties({
            categories,
            list,
        });
    },

    createCategory() {
        return new ShortcutCategory(...arguments);
    },

    createShortcutConfiguration() {
        return new ShortcutConfiguration(...arguments);
    },

    bind(id, fn, component = null) {
        const configuration = this.get('list').findBy('id', id);

        if (configuration) {
            const targetElement = component ? component.get('element') : null;
            const mousetrap = targetElement ? Mousetrap.call(Mousetrap, targetElement) : Mousetrap;
            mousetrap.bind(configuration.keys, fn);
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