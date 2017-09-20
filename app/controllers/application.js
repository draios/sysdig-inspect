/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import Ember from 'ember';
import utils from '../utils';

export default Ember.Controller.extend({
    captureFilePath: null,
    serverPort: null,

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
