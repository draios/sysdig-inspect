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
                'views.next',
                'views',
                'Open next view',
                ['k']
            ),
            new ShortcutConfiguration(
                'views.previous',
                'views',
                'Open previous view',
                ['j']
            ),
            new ShortcutConfiguration(
                'dataTables.drillDown',
                'dataTables',
                'Drill down',
                ['enter']
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
            ),
            new ShortcutConfiguration(
                'dataTables.selectNext',
                'dataTables',
                'Select next',
                ['down']
            ),
            new ShortcutConfiguration(
                'dataTables.selectPrevious',
                'dataTables',
                'Select previous',
                ['up']
            )
        ];
    }).readOnly(),

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