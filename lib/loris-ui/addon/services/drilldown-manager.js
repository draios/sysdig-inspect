import Ember from 'ember';

const VIEW_ID_OVERVIEW = 'overview';

export default Ember.Service.extend({
    summaryMetrics: Ember.inject.service('fetch-capture-summary'),

    convertFromUrl({ viewId, drilldownInfoParam }) {
        if (Ember.isEmpty(drilldownInfoParam) === true) {
            return [
                new DrilldownStep(viewId)
            ];
        } else {
            return DrilldownUrlInfo.deserializeSteps(drilldownInfoParam);
        }
    },

    convertToUrl(steps) {
        if (Ember.isEmpty(steps) === true) {
            return new DrilldownUrlInfo('overview');
        } else {
            return new DrilldownUrlInfo(steps[steps.length - 1].viewId, steps);
        }
    },

    selectRootView(viewId) {
        return [
            new DrilldownStep(viewId)
        ];
    },

    selectStep(steps, step) {
        const indexOf = steps.indexOf(step);

        if (indexOf === -1) {
            console.assert(
                false,
                'Argument exception',
                'Drilldown step not found in list',
                ...arguments
            );

            return steps;
        } else if (indexOf === 0) {
            return this.selectRootView(VIEW_ID_OVERVIEW);
        } else if (indexOf < steps.length - 1) {
            return steps.slice(0, steps.indexOf(step));
        } else {
            return steps;
        }
    },

    selectViewElement(steps, selection, filter) {
        const currentStep = steps[steps.length - 1];

        return [
            ...steps.slice(0, steps.length - 2),
            new DrilldownStep(currentStep.viewId, selection, filter)
        ];
    },

    drillDown(steps, selection, filter, nextViewId) {
        const currentStep = steps[steps.length - 1];

        return [
            ...steps.slice(0, steps.length - 2),
            new DrilldownStep(currentStep.viewId, selection, filter),
            new DrilldownStep(nextViewId)
        ];
    },

    buildViewFilter(steps) {
        if (Ember.isEmpty(steps)) {
            return null;
        } else if (steps.length === 1) {
            return null;
        } else {
            // the current step needs to previous one's filter
            // remember that each step's filter always includes the entire drilldown filter
            return steps[steps.length - 2].filter;
        }
    },
});

class DrilldownStep {
    constructor(viewId, selection, filter) {
        this.viewId = viewId;
        this.selection = selection;
        this.filter = filter;
    }
}

class DrilldownUrlInfo {
    constructor(viewId, steps = null) {
        this.viewId = viewId;
        this.drilldownInfoParam = this.serializeSteps(steps);
    }

    serializeSteps(steps) {
        return JSON.stringify(steps);
    }

    static deserializeSteps(drilldownInfoParam) {
        return JSON.parse(drilldownInfoParam).map((step) => new DrilldownStep(step.viewId, step.selection, step.filter));
    }
}
