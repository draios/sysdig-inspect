import Ember from 'ember';

let stores;

export default Ember.Service.extend({
    init() {
        this._super(...arguments);

        this.reset();
    },

    reset() {
        stores = {};
    },

    store(id, data) {
        stores[id] = data;
    },

    find(id) {
        return stores[id];
    },

    delete(id) {
        delete stores[id];
    },
});
