import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL,
});

Router.map(function() {
    this.route('index',     { path: '/' });

    this.route('capture',   { path: '/capture/:filePath' }, function() {
        this.route('index',     { path: '/' });
    });

    this.route('electron');
});

export default Router;
