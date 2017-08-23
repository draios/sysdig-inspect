/* global window */

import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
    init() {
        window.addEventListener('resize', () => {
            Ember.run.debounce(this, triggerEvent, 20);
        });
    },

    onLayoutChanged(target, fn) {
        this.on('layoutChanged', target, fn);
    },

    offLayoutChanged(target, fn) {
        this.off('layoutChanged', target, fn);
    },

    didChange() {
        Ember.run.scheduleOnce('afterRender', triggerEvent.bind(this));
    },

    whenSettled(fn) {
        Ember.run.schedule('afterRender', fn);
    },
});

function triggerEvent() {
    this.trigger('layoutChanged');
}
