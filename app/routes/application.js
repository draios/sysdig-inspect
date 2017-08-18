import Ember from 'ember';
import utils from '../utils';

export default Ember.Route.extend({
    setupController(...args) {
        this._super(...args);

        utils.addShortcut(['command+o', 'ctrl+o'], () => {
            this.controllerFor('application').openFile();
        });
    },
});
