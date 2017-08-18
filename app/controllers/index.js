import Ember from 'ember';

export default Ember.Controller.extend({
    appController: Ember.inject.controller('application'),

    actions: {
        openFile() {
            this.get('appController').send('openFile');
        },
    },
});
