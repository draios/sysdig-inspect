import Ember from 'ember';
import layout from '../templates/components/sd-viz-timeline-draggable-handle';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-viz-timeline__draggable-handle'],

    mouseDown(e) {
        this.sendAction('drag', e.clientX);

        return false;
    },
});
