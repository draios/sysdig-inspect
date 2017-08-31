/* global FocusEvent */

import Ember from 'ember';
import layout from '../templates/components/wsd-capture-panel';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-panel'],

    layoutProvider: Ember.inject.service('layout-provider'),
    drilldownManager: Ember.inject.service('drilldown-manager'),

    filePath: null,
    drilldownInfoParam: null,
    timelines: null,
    timeWindow: null,
    selectedViewId: null,

    drilldownInfo: Ember.computed('selectedViewId', 'drilldownInfoParam', function() {
        return  this.get('drilldownManager').convertFromUrl({
            viewId: this.get('selectedViewId'),
            drilldownInfoParam: this.get('drilldownInfoParam'),
        });
    }).readOnly(),

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => {
            const el = document.querySelector('[tabIndex="0"]');

            if (el) {
                const e = new FocusEvent('focus');
                el.dispatchEvent(e);
            }
        });
    },

    actions: {
        selectView(id) {
            const drilldownManager = this.get('drilldownManager');
            const drilldownInfo = drilldownManager.selectView(this.get('drilldownInfo'), id);
            this.sendAction('navigateTo', drilldownManager.convertToUrl(drilldownInfo));
        },

        navigateTo(step) {
            const drilldownManager = this.get('drilldownManager');
            const drilldownInfo = drilldownManager.selectStep(this.get('drilldownInfo'), step);
            this.sendAction('navigateTo', drilldownManager.convertToUrl(drilldownInfo));
        },
    },
});
