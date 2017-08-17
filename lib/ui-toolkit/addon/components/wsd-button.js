import Ember from 'ember';
import layout from '../templates/components/wsd-button';

export default Ember.Component.extend({
    layout,
    tagName: 'button',
    classNames: ['wsd-button'],
    classNameBindings: ['isSmall:wsd-button--sm'],

    size: 'md',
    isSmall: Ember.computed.equal('size', 'sm').readOnly(),

    click() {
        this.send('click');
    },
});
