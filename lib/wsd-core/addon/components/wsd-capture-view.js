import Ember from 'ember';
import layout from '../templates/components/wsd-capture-view';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-view'],
    drilldownManager: Ember.inject.service('drilldown-manager'),
    dataStoreService: Ember.inject.service('fetch-view-data'),
    viewDataStoreService: Ember.inject.service('fetch-views'),

    captureInfo: null,

    drilldownInfo: Ember.computed('captureInfo.queryParams.drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            drilldownInfoParam: this.get('captureInfo.queryParams.drilldownInfoParam'),
        });
    }).readOnly(),

    viewConfiguration: Ember.computed('drilldownInfo', function() {
        const drilldownInfo = this.get('drilldownInfo');
        return drilldownInfo[drilldownInfo.length - 1];
    }).readOnly(),

    timeWindow: Ember.computed('captureInfo.queryParams.timeFrom', 'captureInfo.queryParams.timeTo', function() {
        if (Ember.isNone(this.get('captureInfo.queryParams.timeFrom')) === false && Ember.isNone(this.get('captureInfo.queryParams.timeTo')) === false) {
            return {
                from: this.get('captureInfo.queryParams.timeFrom'),
                to: this.get('captureInfo.queryParams.timeTo'),
            };
        } else {
            return null;
        }
    }).readOnly(),

    filter: Ember.computed('drilldownInfo', 'timeWindow', function() {
        return this.get('drilldownManager').buildViewFilter(this.get('drilldownInfo'), this.get('timeWindow'));
    }).readOnly(),

    dataStore: Ember.computed('captureInfo.filePath', 'viewId', 'timeWindow', 'filter', function() {
        return this.get('dataStoreService').fetch(
            this.get('captureInfo.filePath'),
            this.get('viewId'),
            {
                timeWindow: this.get('timeWindow'),
                filter: this.get('filter'),
            }
        );
    }).readOnly(),

    viewDataStore: Ember.computed('viewId', function() {
        return this.get('viewDataStoreService').fetchById(this.get('viewId'));
    }).readOnly(),

    name: Ember.computed('viewId', 'viewDataStore.view.name', function() {
        switch (this.get('viewId')) {
            case 'overview':
                return 'Capture Overview';
            case 'dig':
                return 'Dig';
            case 'echo':
                return 'Echo';
            default:
                return this.get('viewDataStore.view.name');
        }
    }).readOnly(),

    dataComponentName: Ember.computed('viewId', function() {
        switch (this.get('viewId')) {
            case 'dig':
                return 'wsd-capture-data-dig';
            case 'echo':
                return 'wsd-capture-data-echo';
            default:
                return 'wsd-capture-data-table';
        }
    }).readOnly(),

    actions: {
        select(row) {
            const nextDrilldownInfo = this.get('drilldownManager').selectViewElement(
                this.get('drilldownInfo'),
                row.id,
                this.get('dataStore.info.filterTemplate')
            );

            this.sendAction('select', this.get('drilldownManager').convertToUrl(nextDrilldownInfo));
        },

        drillDown(actionName, row) {
            let viewId;
            switch (actionName) {
                case 'drillDown':
                    viewId = this.get('viewDataStore.view.drilldownTarget');
                    break;
                case 'dig':
                    viewId = 'dig';
                    break;
                case 'echo':
                    viewId = 'echo';
                    break;
            }

            const nextDrilldownInfo = this.get('drilldownManager').drillDown(
                this.get('drilldownInfo'),
                row.id,
                this.get('dataStore.info.filterTemplate'),
                viewId
            );

            this.sendAction('drillDown', this.get('drilldownManager').convertToUrl(nextDrilldownInfo));
        },
    },
});
