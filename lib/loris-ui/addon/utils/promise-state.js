import Ember from 'ember';

export default Ember.Object.extend({
    isLoading: false,
    loadPromise: null,
    hasPartiallyLoaded: false,
    hasLoaded: false,
    hasFailed: false,
    data: null,
    error: null,

    load(promise) {
        this.setProperties(
            Object.assign(
                {
                    isLoading: true,
                    loadPromise: promise,
                    hasPartiallyLoaded: false,
                    hasLoaded: false,
                    hasFailed: false,
                },
                this.resetData()
            )
        );
    },

    loadData(data) {
        this.load(Ember.RSVP.Promise.resolve());
        this.succeedLoad(data);
    },

    completePartialLoad(data) {
        this.setProperties(
            Object.assign(
                {
                    hasPartiallyLoaded: true,
                },
                this.parsePartialData(data)
            )
        );
    },

    succeedLoad(data) {
        this.setProperties(
            Object.assign(
                {
                    isLoading: false,
                    hasPartiallyLoaded: false,
                    hasLoaded: true,
                },
                this.parseData(data)
            )
        );
    },

    failLoad(error) {
        this.setProperties(
            Object.assign(
                {
                    isLoading: false,
                    hasPartiallyLoaded: false,
                    hasFailed: true,
                },
                this.parseError(error)
            )
        );
    },

    resetData() {
        return {
            data: null,
            error: null,
        };
    },

    parsePartialData() {
        return {};
    },

    parseData(data) {
        return {
            data,
        };
    },

    parseError(error) {
        return {
            error,
        };
    },
});
