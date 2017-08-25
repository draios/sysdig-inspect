import Ember from 'ember';
import layout from '../templates/components/sd-list';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-list'],

    items: null,
});
