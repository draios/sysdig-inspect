import Ember from 'ember';

export default Ember.Service.extend({
    createOverviewStep() {
        return new DrilldownStep('overview', 'Capture Overview');
    },

    createStep(id, name, filter, isCurrent) {
        return new DrilldownStep(id, name, filter, isCurrent);
    },

    convertFromUrl({ viewId, drilldownInfo }) {
        if (Ember.isEmpty(drilldownInfo) === true) {
            return [
                new DrilldownStep('overview', 'Capture Overview', null, viewId === 'overview')
            ];
        } else {
            return drilldownInfo.map((step) => {
                return new DrilldownStep(step.id, step.name, step.filter);
            });
        }
    },

    convertToUrl(steps) {
        if (Ember.isEmpty(steps) === true) {
            return [];
        } else {
            return steps.map((step) => {
                return new UrlDrilldownStep(step.id, step.filter);
            });
        }
    },
});

class DrilldownStep {
    constructor(id, name, filter, isCurrent = false) {
        this.id = id;
        this.name = name;
        this.filter = filter;
        this.isCurrent = isCurrent;
    }
}

class UrlDrilldownStep {
    constructor(id, filter) {
        this.id = id;
        this.filter = filter;
    }
}
