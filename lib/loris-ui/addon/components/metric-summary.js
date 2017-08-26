import Ember from 'ember';
import layout from '../templates/components/metric-summary';

const IS_COLOR_CODING_ENABLED = false;

export default Ember.Component.extend({
    layout,
    classNames: ['metric-summary'],
    // classNameBindings: ['isSelected:metric-summary--is-selected'],
    attributeBindings: ['style'],
    colorProvider: Ember.inject.service('color-provider'),

    data: null,
    isSelected: false,

    timeSeriesHeight: 30,
    timeSeriesWidth: 140,

    style: Ember.computed('data', function() {
        if (IS_COLOR_CODING_ENABLED) {
            const category = this.get('data.category');
            const baseColor = this.get('colorProvider').getColor(`metric-category-${category}`);
            const color = this.get('colorProvider').changeOpacity(baseColor, 0.1);

            return Ember.String.htmlSafe(`background-color: ${color};`);
        } else {
            return null;
        }
    }).readOnly(),

    // click() {
    //     this.sendAction('select');
    // },
});
