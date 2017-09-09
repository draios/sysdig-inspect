import Ember from 'ember';

export default Ember.Object.extend({
    isLoading: false,
    loadPromise: null,
    hasPartiallyLoaded: false,
    hasLoaded: false,
    hasFailed: false,
    data: null,
    error: null,

    hasData: Ember.computed('isLoading', 'hasLoaded', function() {
        return (this.get('isLoading') || this.get('hasLoaded')) && this.isEmpty() === false;
    }).readOnly(),

    hasNoData: Ember.computed('hasLoaded', function() {
        return this.get('hasLoaded') && this.isEmpty() === true;
    }).readOnly(),

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
        this.beginPropertyChanges();

        this.setProperties(
            Object.assign(
                {
                    hasPartiallyLoaded: true,
                },
                this.parsePartialData(data)
            )
        );

        this.notifyPropertyChange('hasData');
        this.endPropertyChanges();
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

        return this;
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

        return this;
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

    isEmpty() {
        return Ember.isEmpty(this.get('data'));
    },
});
