import Ember from 'ember';
import utils from '../utils';

export default Ember.Route.extend({
    setupController(...args) {
        this._super(...args);

        utils.addShortcut('mod+o', () => {
            this.controllerFor('application').openFile();
        });
    },
});
