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
import utils from '../utils';

export default Ember.Route.extend({
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),
    colorProvider: Ember.inject.service('color-provider'),

    setupController() {
        this._super(...arguments);

        utils.addShortcut('mod+o', () => {
            this.send('openFileBrowser').openFile();
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

                shortcuts.defineShortcut('general.cancel',              'general',      'Cancel',                   ['esc']),
                shortcuts.defineShortcut('general.accept',              'general',      'Accept',                   ['enter']),
                shortcuts.defineShortcut('general.search',              'general',      'Search',                   ['s']),
                shortcuts.defineShortcut('general.filter',              'general',      'Filter',                   ['f']),

                shortcuts.defineShortcut('navigation.drillDown',        'navigation',   'Drill down',               ['enter']),
                shortcuts.defineShortcut('navigation.drillUp',          'navigation',   'Drill up',                 ['backspace']),

                shortcuts.defineShortcut('views.previous',              'views',        'Open previous view',       ['k']),
                shortcuts.defineShortcut('views.next',                  'views',        'Open next view',           ['j']),

                shortcuts.defineShortcut('dataTables.echo',             'dataTables',   'I/O stream',               ['e']),
                shortcuts.defineShortcut('dataTables.dig',              'dataTables',   'Syscalls',                 ['d']),
                shortcuts.defineShortcut('dataTables.selectNext',       'dataTables',   'Select next view',         ['down']),
                shortcuts.defineShortcut('dataTables.selectPrevious',   'dataTables',   'Select previous view',     ['up']),

                shortcuts.defineShortcut('overview.drillDown',          'overview',     'Drill down',               ['enter']),
                shortcuts.defineShortcut('overview.toggleTimeline',     'overview',     'Pin/unpin timeline',       ['space']),
                shortcuts.defineShortcut('overview.selectLeft',         'overview',     'Select left',              ['left']),
                shortcuts.defineShortcut('overview.selectRight',        'overview',     'Select right',             ['right']),
                shortcuts.defineShortcut('overview.selectUp',           'overview',     'Select up',                ['up']),
                shortcuts.defineShortcut('overview.selectDown',         'overview',     'Select down',              ['down'])
            ]
        );

        this.get('colorProvider').setDefaults({
            // http://www.color-hex.com/color/6b768e
            HISTOGRAM_COLUMN_EMPTY: '#E4E4E4',
            HISTOGRAM_COLUMN_DEFAULT: '#798399',
            HISTOGRAM_COLUMN_DEFAULT_LIGHT: '#D2D5DD',
            HISTOGRAM_COLUMN_LIGHT: '#E1E3E8',
        });

        utils.setupHookForLinks();
    },

    actions: {
        openFileBrowser() {
            if (utils.isElectron()) {
                let fileNames = utils.openFileDialog();

                if (Ember.isEmpty(fileNames) === false) {
                    this.send('openFile', fileNames[0]);
                } else {
                    console.log('Not file choosen.');
                }
            }
        },

        openFile(path) {
            this.transitionTo('capture', path);
        },

        closeFile() {
            this.transitionTo('index');
        },
    },
});
