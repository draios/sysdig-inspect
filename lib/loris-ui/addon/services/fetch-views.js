import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    store: Ember.inject.service(),

    fetch() {
        const promiseState = ViewsPromiseState.create();

        promiseState.load(
            this.get('store')
            .findAll('view')
            .then(
                (data) => promiseState.succeedLoad(data),
                (error) => promiseState.failLoad(error)
            )
        );

        return promiseState;
    },

    fetchById(viewId) {
        const promiseState = ViewPromiseState.create();

        promiseState.load(
            this.get('store')
            .findAll('view')
            .then(
                (data) => promiseState.succeedLoad(data.findBy('id', viewId)),
                (error) => promiseState.failLoad(error)
            )
        );

        return promiseState;
    },
});

const ViewsPromiseState = PromiseState.extend({
    views: null,

    resetData() {
        return {
            views: null,
        };
    },

    parseData(data) {
        return {
            views: data.filterBy('isForWsysdig', true),
        };
    },
});

const ViewPromiseState = PromiseState.extend({
    view: null,

    resetData() {
        return {
            view: null,
        };
    },

    parseData(data) {
        return {
            view: data,
        };
    },
});

