import Ember from 'ember';
import utils from '../utils';

export default Ember.Controller.extend({
    captureFilePath: null,

    openFile() {
        if (utils.isElectron()) {
            let fileNames = utils.openFileDialog();

            if (Ember.isEmpty(fileNames) === false) {
                this.transitionToRoute('capture', fileNames[0]);
            } else {
                console.log('Not file choosen.');
            }
        } else {
            console.error('Cannot open file with web interface.');
        }
    },

    actions: {
        openFile() {
            this.openFile();
        },
    },
});
