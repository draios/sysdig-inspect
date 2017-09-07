import Ember from 'ember';
import layout from '../templates/components/wsd-metric-tile';

const IS_COLOR_CODING_ENABLED = false;

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-metric-tile'],
    classNameBindings: [
        'isSelected:wsd-metric-tile--is-selected',
        'isTimelinePinned:wsd-metric-tile--is-pinned',
        'isNoteworthy:wsd-metric-tile--is-noteworthy',
        'isEmpty:wsd-metric-tile--is-empty'
    ],
    attributeBindings: ['tabIndex', 'style'],
    colorProvider: Ember.inject.service('color-provider'),

    data: null,
    isSelected: false,
    isTimelinePinned: false,

    timeSeriesHeight: 20,
    timeSeriesWidth: 130,

    tabIndex: 0,
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

    buttonsColor: Ember.computed('isTimelinePinned', function() {
        return this.get('isTimelinePinned') ? 'white' : null;
    }).readOnly(),

    isNoteworthy: Ember.computed.equal('data.noteworthy', true).readOnly(),
    isEmpty: Ember.computed.equal('data.totalValue', 0).readOnly(),

    click() {
        this.sendAction('toggleTimeline');
    },

    doubleClick() {
        this.sendAction('drillDown');

        return false;
    },

    focusIn() {
        this.sendAction('select');
    },
});
