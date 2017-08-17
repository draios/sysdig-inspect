import Ember from 'ember';
import config from '../appConfig';

export default Ember.Route.extend({
    beforeModel() {
        if (config.isElectron()) {
            this.replaceWith('electron');
        }
    },
});
