/* global d3, moment, oboe */

import Ember from 'ember';

export default Ember.Service.extend({
    fetch() {
        // let url = `/captures/${encodeURIComponent(fileName)}/summary`;
        console.log(d3.version);
        console.log(moment().format('ddd, hA'));
        console.log(oboe.version);
        // return oboe(url);
    }
});
