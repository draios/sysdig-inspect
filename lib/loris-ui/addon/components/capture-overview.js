/* global d3 */

import Ember from 'ember';
import layout from '../templates/components/capture-overview';

export default Ember.Component.extend({
    layout,

    didInsertElement() {
        d3.init();
    }
});
