/* global Mousetrap */

import Ember from 'ember';

export default Ember.Service.extend({
    categories: Ember.computed(function() {
        return [
            new ShortcutCategory(
                'general',
                'General'
            )
        ];
    }).readOnly(),

    list: Ember.computed(function() {
        return [
            new ShortcutConfiguration(
                'shortcutsHelp',
                'general',
                'Keyboard shortcuts help',
                ['?']
            ),
            new ShortcutConfiguration(
                'dataTables.echo',
                'dataTables',
                'Echo',
                ['e']
            ),
            new ShortcutConfiguration(
                'dataTables.dig',
                'dataTables',
                'Dig',
                ['d']
            )
        ];
    }).readOnly(),

    bind(id, fn, component = null) {
        const configuration = this.get('list').findBy('id', id);

        if (configuration) {
            const targetElement = component ? component.get('element') : null;
            Mousetrap
                .call(Mousetrap, targetElement)
                .bind(configuration.keys, () => {
                    fn();
                }
            );
        }
    },

    unbind(id, component = null) {
        const configuration = this.get('list').findBy('id', id);

        if (configuration) {
            const targetElement = component ? component.get('element') : null;
            Mousetrap.call(Mousetrap, targetElement).unbind(configuration.keys);
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