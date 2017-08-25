import Ember from 'ember';
import layout from '../templates/components/wsd-capture-breadcrumbs';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-breadcrumbs'],

    steps: null,

    home: Ember.computed('steps', function() {
        if (Ember.isEmpty(this.get('steps')) === false) {
            return this.get('steps')[0];
        } else {
            return null;
        }
    }).readOnly(),

    nextSteps: Ember.computed('steps', function() {
        if (Ember.isEmpty(this.get('steps')) === false) {
            return this.get('steps').slice(1);
        } else {
            return null;
        }
    }).readOnly(),

    actions: {
        navigateTo(step) {
            this.sendAction('navigateTo', this.get('steps').slice(0, this.get('steps').indexOf(step) + 1));
        },
    }
});
