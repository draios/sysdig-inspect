/* global d3 */

import Ember from 'ember';
import layout from '../templates/components/sd-time-series';

export default Ember.Component.extend({
    layout,
    tagName: 'svg',
    classNames: ['sd-time-series'],
    classNameBindings: ['themeClassName', 'isSelected:sd-time-series--is-selected'],
    attributeBindings: ['width', 'height'],

    data: null,
    isSelected: false,
    width: 100,
    height: 50,
    timestampProp: 'x',
    valueProp: 'y',

    theme: null,
    themeClassName: Ember.computed('theme', function() {
        if (this.get('theme')) {
            return `sd-time-series--theme-${this.get('theme')}`;
        } else {
            return null;
        }
    }).readOnly(),

    canBeRendered: Ember.computed('width', 'height', function() {
        return this.get('width') > 0 && this.get('height') > 0;
    }).readOnly(),
});
