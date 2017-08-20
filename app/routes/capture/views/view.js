import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        return {
            id: params.id,
            filePath: this.modelFor('capture').filePath,
        };
    },
});
