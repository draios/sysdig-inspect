import Ember from 'ember';
import layout from '../templates/components/sd-button';

export default Ember.Component.extend({
    layout,
    tagName: 'button',
    classNames: ['sd-button'],
    classNameBindings: ['isSmall:sd-button--sm'],
    attributeBindings: ['tabIndex'],

    tabIndex: 0,

    size: 'md',
    isSmall: Ember.computed.equal('size', 'sm').readOnly(),
});
