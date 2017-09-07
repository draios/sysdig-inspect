import Ember from 'ember';
import layout from '../templates/components/wsd-view-list';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-view-list'],

    shortcutsService: Ember.inject.service('keyboard-shortcuts'),
    viewsManager: Ember.inject.service('views-manager'),

    selectedViewId: null,
    steps: null,

    views: Ember.computed('viewsManager.store.views', 'steps', 'selectedViewId', function() {
        const views = this.get('viewsManager.store.views');
        const steps = this.get('steps');
        const selectedViewId = this.get('selectedViewId');

        if (Ember.isEmpty(views)) {
            return null;
        } else if (Ember.isEmpty(steps) === false && steps.length > 1) {
            return this.get('viewsManager').getStepViewConfigurations(steps)
                .map((configuration) => new ViewListItemConfiguration(configuration, selectedViewId === configuration.id))
            ;
        } else {
            return this.get('viewsManager')
                .getRootViewConfigurations()
                .map((configuration) => new ViewListItemConfiguration(configuration, selectedViewId === configuration.id))
            ;
        }
    }).readOnly(),

    didInsertElement() {
        this.get('shortcutsService').bind(
            'views.next',
            () => {
                const views = this.get('views');
                if (Ember.isEmpty(views) === false) {
                    const selection = views.filterBy('viewId', this.get('selectedViewId'));
                    if (Ember.isEmpty(selection) === false) {
                        const indexOf = views.indexOf(selection[0]);
                        if (indexOf === views.length - 1) {
                            this.send('selectView', views[0]);
                        } else {
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
                    const selection = views.filterBy('viewId', this.get('selectedViewId'));
                    if (Ember.isEmpty(selection) === false) {
                        const indexOf = views.indexOf(selection[0]);
                        if (indexOf === 0) {
                            this.send('selectView', views[views.length - 1]);
                        } else {
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
        selectView(view) {
            this.sendAction('select', view.configuration.id);
        },
    },
});

class ViewListItemConfiguration {
    constructor(configuration, isSelected = false) {
        this.configuration = configuration;
        this.isSelected = isSelected;
    }
}
