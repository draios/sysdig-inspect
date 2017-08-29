import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    buildURL() {
        return '/capture/views';
    },
});
