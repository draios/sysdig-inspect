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
import layout from '../templates/components/wsd-view-list';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-view-list'],

    shortcutsService: Ember.inject.service('keyboard-shortcuts'),
    viewsManager: Ember.inject.service('views-manager'),

    selectedViewId: null,
    steps: null,

    views: Ember.computed('viewsManager.store.views', 'steps', function() {
        const views = this.get('viewsManager.store.views');
        const steps = this.get('steps');

        if (Ember.isEmpty(views)) {
            return null;
        } else if (Ember.isEmpty(steps) === false && steps.length > 1) {
            return this.get('viewsManager').getStepViewConfigurations(steps)
                .map((configuration) => new ViewListItemConfiguration(configuration))
            ;
        } else {
            return this.get('viewsManager')
                .getRootViewConfigurations()
                .map((configuration) => new ViewListItemConfiguration(configuration))
            ;
        }
    }).readOnly(),

    isEchoSelected: Ember.computed.equal('selectedViewId', 'echo').readOnly(),
    isDigSelected: Ember.computed.equal('selectedViewId', 'dig').readOnly(),

    didInsertElement() {
        this.get('shortcutsService').bind(
            'views.next',
            () => {
                const views = this.get('views');
                if (Ember.isEmpty(views) === false) {
                    const selection = views.findBy('configuration.id', this.get('selectedViewId'));
                    if (Ember.isNone(selection) === false) {
                        const indexOf = views.indexOf(selection);
                        if (indexOf < views.length - 1) {
                            this.send('selectView', views[indexOf + 1]);
                        }
                    } else {
                        this.send('selectView', views[0]);
                    }
                }
            }
        );
        this.get('shortcutsService').bind(
            'views.previous',
            () => {
                const views = this.get('views');
                if (Ember.isEmpty(views) === false) {
                    const selection = views.findBy('configuration.id', this.get('selectedViewId'));
                    if (Ember.isNone(selection) === false) {
                        const indexOf = views.indexOf(selection);
                        if (indexOf > 0) {
                            this.send('selectView', views[indexOf - 1]);
                        }
                    } else {
                        this.send('selectView', views[views.length - 1]);
                    }
                }
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('views.next');
        this.get('shortcutsService').unbind('views.previous');
    },

    actions: {
        selectView(viewOrId) {
            this.sendAction('select', Ember.typeOf(viewOrId) === 'string' ? viewOrId : viewOrId.configuration.id);
        },
    },
});

class ViewListItemConfiguration {
    constructor(configuration) {
        this.configuration = configuration;
    }

    get iconName() {
        switch (this.configuration.id) {
            case 'echo':
                return 'echo';
            case 'dig':
                return 'dig';
            default:
                return null;
        }
    }
}
