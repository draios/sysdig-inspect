import Ember from 'ember';
import layout from '../templates/components/wsd-echo-op';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-echo-op'],
    classNameBindings: [
        'isRead:wsd-echo-op--is-read:wsd-echo-op--is-write',
        'isNotSearchMatch:wsd-echo-op--is-not-search-match'
    ],

    op: null,

    isNotSearchMatch: Ember.computed('op.meta.isMatch', function() {
        return this.get('op.meta.isMatch') === false;
    }).readOnly(),

    container: Ember.computed.readOnly('op.d.0'),
    proc: Ember.computed.readOnly('op.d.1'),
    fd: Ember.computed.readOnly('op.d.2'),
    dir: Ember.computed.readOnly('op.d.3'),
    length: Ember.computed.readOnly('op.d.4'),
    output: Ember.computed.readOnly('op.d.5'),

    isRead: Ember.computed.equal('dir', '<').readOnly(),
});
