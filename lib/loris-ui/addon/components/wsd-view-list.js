import Ember from 'ember';
import layout from '../templates/components/wsd-view-list';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-view-list'],
    dataStoreService: Ember.inject.service('fetch-views'),

    dataStore: Ember.computed(function() {
        return this.get('dataStoreService').fetch();
    }).readOnly(),

    selectedViewId: null,
    drilldownConfiguration: null,

    views: Ember.computed('dataStore.views', 'drilldownConfiguration', 'selectedViewId', function() {
        const data = this.get('dataStore.views');
        const drilldownConfiguration = this.get('drilldownConfiguration');
        const selectedViewId = this.get('selectedViewId');

        if (Ember.isEmpty(data)) {
            return null;
        } else if (drilldownConfiguration) {
            return data.map((data) => ViewConfiguration.create(id, data.findBy(id), selectedViewId === id));
        } else {
            return [
                'procs',
                'files',
                'directories',
                'sports',
                'connections',
                'spy_users'
            ]
                .map((id) => ViewConfiguration.create(id, data.findBy('id', id), selectedViewId === id))
            ;
        }
    }).readOnly(),
});

class ViewConfiguration {
    constructor(id, data, isSelected=false, isDivider=false) {
        this.id = id;
        this.data = data;
        this.isSelected = isSelected;
        this.isDivider = isDivider;
    }

    static createDivider() {
        return new ViewConfiguration('-', null, false, true);
    }

    static create(id, data, isSelected) {
        return new ViewConfiguration(id, data, isSelected);
    }
}