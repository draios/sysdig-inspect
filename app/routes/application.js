import Ember from 'ember';
import utils from '../utils';

export default Ember.Route.extend({
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    setupController(...args) {
        this._super(...args);

        utils.addShortcut('mod+o', () => {
            this.controllerFor('application').openFile();
        });

        const shortcuts = this.get('shortcutsService');
        shortcuts.setShortcuts(
            [
                shortcuts.defineCategory('general', 'General'),
                shortcuts.defineCategory('views', 'Views'),
                shortcuts.defineCategory('overview', 'Capture Overview'),
                shortcuts.defineCategory('dataTables', 'Data tables')
            ],
            [
                shortcuts.defineShortcut('shortcutsHelp',               'general',      'Keyboard shortcuts help',  ['?']),

                shortcuts.defineShortcut('views.next',                  'views',        'Open next view',           ['k']),
                shortcuts.defineShortcut('views.previous',              'views',        'Open previous view',       ['j']),

                shortcuts.defineShortcut('dataTables.drillDown',        'dataTables',   'Drill down',               ['enter']),
                shortcuts.defineShortcut('dataTables.echo',             'dataTables',   'Echo',                     ['e']),
                shortcuts.defineShortcut('dataTables.dig',              'dataTables',   'Dig',                      ['d']),
                shortcuts.defineShortcut('dataTables.selectNext',       'dataTables',   'Select next view',         ['down']),
                shortcuts.defineShortcut('dataTables.selectPrevious',   'dataTables',   'Select previous view',     ['up']),

                shortcuts.defineShortcut('overview.drillDown',          'overview',     'Drill down',               ['enter']),
                shortcuts.defineShortcut('overview.toggleTimeline',     'overview',     'Pin/unpin timeline',       ['t']),
                shortcuts.defineShortcut('overview.selectLeft',         'overview',     'Select left',              ['left']),
                shortcuts.defineShortcut('overview.selectRight',        'overview',     'Select right',             ['right']),
                shortcuts.defineShortcut('overview.selectUp',           'overview',     'Select up',                ['up']),
                shortcuts.defineShortcut('overview.selectDown',         'overview',     'Select down',              ['down'])
            ]
        );
    },
});
