import Ember from 'ember';
import layout from '../templates/components/view-list';

export default Ember.Component.extend({
    layout,
    classNames: ['view-list'],
    fetchViews: Ember.inject.service('fetch-views'),

    viewListData: null,

    init(...args) {
        this._super(...args);

        this.set('viewListData', this.get('fetchViews').fetch());
    },
});
