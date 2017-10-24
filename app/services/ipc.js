import Ember from 'ember';
import electronUtils from 'wsd-core/utils/electron';

export default Ember.Service.extend(Ember.Evented, {
    ipcRenderer: null,

    setup() {
        // see: https://electron.atom.io/docs/api/web-contents/#contentssendchannel-arg1-arg2-
        const { ipcRenderer } = requireNode('electron');

        ipcRenderer.on('open-file', (sender, ...args) => {
            this.trigger('open-file', ...args);
        });

        this.set('ipcRenderer', ipcRenderer);
    },

    on() {
        if (!electronUtils.isElectron()) {
            return;
        }

        if (!this.get('ipcRenderer')) {
            this.setup();
        }

        // see: https://www.emberjs.com/api/ember/2.16/classes/Evented/methods/on?anchor=on
        this._super(...arguments);
    },
});
