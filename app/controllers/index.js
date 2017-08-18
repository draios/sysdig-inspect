import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['port'],
    appController: Ember.inject.controller('application'),

    actions: {
        openFile() {
            this.get('appController').send('openFile');
        },
    },
});
