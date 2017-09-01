import Ember from 'ember';

export default Ember.Service.extend({
    createSession() {
        return new SlowItDown();
    },
});

class SlowItDown {
    constructor() {
        this.queue = [];
        this.delay = 1;
    }

    doIt(fn) {
        this.queue.push(fn);

        if (this.queue.length === 1) {
            setTimeout(() => this.next(), this.delay);
        }
    }

    next() {
        const fn = this.queue.shift();

        Ember.run.schedule('actions', fn);

        if (this.queue.length > 0) {
            setTimeout(() => this.next(), this.delay);
        }
    }
}
