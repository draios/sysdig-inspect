import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: {
        filter: 'filter',
        searchPattern: 'search',
    },

    filter: null,
    searchPattern: null,
});
