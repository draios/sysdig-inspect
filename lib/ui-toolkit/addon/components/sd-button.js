import Ember from 'ember';
import layout from '../templates/components/sd-button';

export default Ember.Component.extend({
    layout,
    tagName: 'button',
    classNames: ['sd-button'],
    classNameBindings: ['isSmall:sd-button--sm', 'isWhite:sd-button--is-white'],
    attributeBindings: ['tabIndex', 'title'],

    tabIndex: 0,

    size: 'md',
    color: null,

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
