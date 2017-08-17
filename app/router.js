import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL,
});

Router.map(function() {
    this.route('capture', { path: '/capture/:filePath' });
    this.route('electron');
});

export default Router;
