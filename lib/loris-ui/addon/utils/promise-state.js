import Ember from 'ember';

export default Ember.Object.extend({
    isLoading: false,
    loadPromise: null,
    hasPartiallyLoaded: false,
    hasLoaded: false,
    hasFailed: false,
    error: null,

    load(promise) {
        this.setProperties({
            isLoading: true,
            loadPromise: promise,
            hasPartiallyLoaded: false,
            hasLoaded: false,
            hasFailed: false,
            error: null,
        });
    },

    completePartialLoad() {
        this.setProperties({
            hasPartiallyLoaded: true,
        });
    },

    succeedLoad() {
        this.setProperties({
            isLoading: false,
            hasPartiallyLoaded: false,
            hasLoaded: true,
        });
    },

    failLoad(error) {
        this.setProperties({
            isLoading: false,
            hasPartiallyLoaded: false,
            hasFailed: true,
            error,
        });
    },
});
