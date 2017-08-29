import Ember from 'ember';
import layout from '../templates/components/wsd-view-list';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-view-list'],
    viewStoreService: Ember.inject.service('fetch-views'),

    viewStore: Ember.computed(function() {
        return this.get('viewStoreService').fetch();
    }).readOnly(),

    selectedViewId: null,
    steps: null,

    views: Ember.computed('viewStore.views', 'steps', 'selectedViewId', function() {
        const views = this.get('viewStore.views');
        const steps = this.get('steps');
        const selectedViewId = this.get('selectedViewId');

        if (Ember.isEmpty(views)) {
            return null;
        } else if (Ember.isEmpty(steps) === false && steps.length > 1) {
            return views.map((view) => ViewConfiguration.create({
                viewId: view.id,
                view,
                isSelected: selectedViewId === view.id
            }));
        } else {
            return [
                'overview',
                'procs',
                'files',
                'directories',
                'sports',
                'connections',
                'spy_users'
            ]
                .map((id) => ViewConfiguration.create({
                    viewId: id,
                    view: views.findBy('id', id),
                    isSelected: selectedViewId === id
                }))
            ;
        }
    }).readOnly(),

    actions: {
        selectView(view) {
            this.sendAction('select', view.get('viewId'));
        },
    },
});

const ViewConfiguration = Ember.Object.extend({
    viewId: null,
    view: null,
    isSelected: false,

    name: Ember.computed('view.name', function() {
        if (this.get('viewId') === 'overview') {
            return 'Capture Overview';
        } else {
            return this.get('view.name');
        }
    }).readOnly(),
});
