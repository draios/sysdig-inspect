import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        this.replaceWith('capture.overview');
    },
});
