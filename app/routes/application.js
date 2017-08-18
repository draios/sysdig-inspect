import Ember from 'ember';
import config from '../appConfig';

export default Ember.Route.extend({

    setupController(...args) {
        this._super(...args);

        config.addShortcut('ctrl+o', () => {
            this.controllerFor('application').openFile();
        });
    },
});
