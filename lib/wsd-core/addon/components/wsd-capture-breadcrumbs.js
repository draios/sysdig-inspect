import Ember from 'ember';
import layout from '../templates/components/wsd-capture-breadcrumbs';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-breadcrumbs'],
    classNameBindings: ['isRoot:wsd-capture-breadcrumbs--is-root'],

    viewStoreService: Ember.inject.service('fetch-views'),
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    viewStore: Ember.computed(function() {
        return this.get('viewStoreService').fetch();
    }).readOnly(),

    steps: null,

    breadcrumbItems: Ember.computed('viewStore.views', 'steps', function() {
        const views = this.get('viewStore.views');
        const steps = this.get('steps');

        if (Ember.isEmpty(steps)) {
            console.assert(false, 'component:wsd-capture-breadcrumbs.breadcrumbSteps', 'Unexpected attribute', 'steps');

            return [];
        } else {
            return steps.map((step, i, list) => {
                return BreadcrumbItem.create({
                    step,
                    view: Ember.isEmpty(views) ? null : views.findBy('id', step.viewId),
                    isSelected: i === list.length - 1,
                    isHome: i === 0,
                });
            });
        }
    }).readOnly(),

    isRoot: Ember.computed.equal('breadcrumbItems.length', 1),

    didInsertElement() {
        this.get('shortcutsService').bind(
            'navigation.drillUp',
            () => {
                const steps = this.get('steps');
                if (steps.length > 1) {
                    this.sendAction('select', steps[steps.length - 2]);
                }
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('navigation.drillUp');
    },
});

const BreadcrumbItem = Ember.Object.extend({
    step: null,

    view: null,
    isSelected: false,
    isHome: null,

    name: Ember.computed('step.viewId', 'view.name', function() {
        switch (this.get('step.viewId')) {
            case 'overview':
                return 'Capture Overview';
            case 'dig':
                return 'Dig';
            case 'echo':
                return 'Echo';
            default:
                return this.get('view.name');
        }
    }).readOnly(),

    description: Ember.computed('step', 'isSelected', function() {
        if (this.get('isSelected')) {
            return null;
        } else {
            return this.get('step.selection') || null;
        }
    }).readOnly(),
});
