import Ember from 'ember';

const {Service, Evented} = Ember;

export default Service.extend(Evented, {
    setup() {
        // see: https://electron.atom.io/docs/api/web-contents/#contentssendchannel-arg1-arg2-
        this.ipcRenderer = requireNode('electron').ipcRenderer;

        this.ipcRenderer.on('open-file', (sender, ...args) => {
            this.trigger('open-file', ...args);
        });
    },
});
