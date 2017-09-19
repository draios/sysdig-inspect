import Ember from 'ember';
import layout from '../templates/components/wsd-capture-data-dig';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-data-dig'],

    rows: Ember.computed('dataStore.rows', function() {
        return this.get('dataStore.rows').map((row) => ({
            data: row.d[0],
            isNotSearchMatch: row.meta ? row.meta.isMatch === false : false,
        }));
    }).readOnly(),
});
