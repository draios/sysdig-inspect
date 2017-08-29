import Ember from 'ember';

export default Ember.Service.extend({
    electronPath: '/capture',
    securePath: '/api/sysdig',

    config: Ember.computed(function() {
        return Ember.getOwner(this).factoryFor('config:environment').class;
    }),

    getURL() {
        let env = this.get('config.targetEnv');

        if (Ember.isNone(env)) {
            throw new Ember.Error('request-url:service requires a targetEnv specification in config/environment.');
        }

        if (env === 'electron') {
            return this.get('electronPath');
        } else if (env === 'secure') {
            return this.get('securePath');
        }
    },
});
