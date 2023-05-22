import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL,
});

Router.map(function() {
    this.route('index',         { path: '/' });
    this.route('capture',       { path: '/capture/:filePath' }, function() {
        this.route('index',         { path: '/' });
        this.route('views',         { path: '/views' }, function() {
            this.route('index',         { path: '/' });
            this.route('view',          { path: '/:id' });
        });
    });
    this.route('electron');
});

export default Router;
