import Ember from 'ember';
import layout from '../templates/components/sd-promise-wait-overlay';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-promise-wait-overlay'],
    classNameBindings: ['promiseState.isLoading:sd-promise-wait-overlay--is-loading'],

    promiseState: null,
});
