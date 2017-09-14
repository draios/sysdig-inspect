import Ember from 'ember';
import layout from '../templates/components/sd-button';

export default Ember.Component.extend({
    layout,
    tagName: 'button',
    classNames: ['sd-button'],
    classNameBindings: [
        'isSmall:sd-button--sm',
        'isWhite:sd-button--is-white',
        'isActive:sd-button--is-active'
    ],
    attributeBindings: ['tabIndex', 'title', 'isDisabled:disabled'],

    tabIndex: 0,

    size: 'md',
    color: null,
    isActive: false,
    isDisabled: false,

    isSmall: Ember.computed.equal('size', 'sm').readOnly(),
    isWhite: Ember.computed.equal('color', 'white').readOnly(),

    iconSize: Ember.computed('size', function() {
        switch (this.get('size')) {
            case 'sm':
                return '16px';
            case 'lg':
                return '32px';
            default:
                return '24px';
        }
    }).readOnly(),
});
