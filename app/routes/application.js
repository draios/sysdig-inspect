import Ember from 'ember';
import utils from '../utils';

export default Ember.Route.extend({
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    setupController(...args) {
        this._super(...args);

        utils.addShortcut('mod+o', () => {
            this.controllerFor('application').openFile();
        });

        this.get('shortcutsService').setShortcuts(
            [
                this.get('shortcutsService').createCategory(
                    'general',
                    'General'
                ),
                this.get('shortcutsService').createCategory(
                    'views',
                    'Views'
                ),
                this.get('shortcutsService').createCategory(
                    'dataTables',
                    'Tables'
                )
            ],
            [
                this.get('shortcutsService').createShortcutConfiguration(
                    'shortcutsHelp',
                    'general',
                    'Keyboard shortcuts help',
                    ['?']
                ),
                this.get('shortcutsService').createShortcutConfiguration(
                    'views.next',
                    'views',
                    'Open next view',
                    ['k']
                ),
                this.get('shortcutsService').createShortcutConfiguration(
                    'views.previous',
                    'views',
                    'Open previous view',
                    ['j']
                ),
                this.get('shortcutsService').createShortcutConfiguration(
                    'dataTables.drillDown',
                    'dataTables',
                    'Drill down',
                    ['enter']
                ),
                this.get('shortcutsService').createShortcutConfiguration(
                    'dataTables.echo',
                    'dataTables',
                    'Echo',
                    ['e']
                ),
                this.get('shortcutsService').createShortcutConfiguration(
                    'dataTables.dig',
                    'dataTables',
                    'Dig',
                    ['d']
                ),
                this.get('shortcutsService').createShortcutConfiguration(
                    'dataTables.selectNext',
                    'dataTables',
                    'Select next',
                    ['down']
                ),
                this.get('shortcutsService').createShortcutConfiguration(
                    'dataTables.selectPrevious',
                    'dataTables',
                    'Select previous',
                    ['up']
                )
            ]
        );
    },
});
