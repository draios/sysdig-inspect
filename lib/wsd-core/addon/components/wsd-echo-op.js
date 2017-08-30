import Ember from 'ember';
import layout from '../templates/components/wsd-echo-op';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-echo-op'],
    classNameBindings: ['isRead:wsd-echo-op--is-read:wsd-echo-op--is-write'],

    op: null,

    isRead: Ember.computed.equal('op.d', '<').readOnly(),
});
