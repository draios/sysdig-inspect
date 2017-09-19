import Ember from 'ember';

const VIEW_ID_OVERVIEW = 'overview';
const FILTER_TEMPLATE_KEY_PLACEHOLDER = '@#$f1CA^&;';

export default Ember.Service.extend({
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

    selectView(steps, viewId) {
        const nextSteps = [
            ...steps.slice(0, steps.length - 1),
            new DrilldownStep(viewId)
        ];

        console.debug('service:drilldown-manager.selectView', viewId, nextSteps);

        return nextSteps;
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
        } else if (indexOf < steps.length - 1) {
            return steps.slice(0, steps.indexOf(step) + 1);
        } else {
            return steps;
        }
    },

    selectViewElement(steps, key, selection, filter) {
        const currentStep = steps[steps.length - 1];

        let nextSteps;
        if (currentStep.selection !== selection) {
            nextSteps = [
                ...steps.slice(0, steps.length - 1),
                new DrilldownStep(currentStep.viewId, key, selection, filter)
            ];
        } else {
            // deselection is not allowed
            nextSteps = steps;
        }

        console.debug('service:drilldown-manager.drillDown', nextSteps);

        return nextSteps;
    },

    drillDown(steps, key, selection, filter, nextViewId) {
        const currentStep = steps[steps.length - 1];

        const nextSteps = [
            ...steps.slice(0, steps.length - 1),
            new DrilldownStep(currentStep.viewId, key, selection, filter),
            new DrilldownStep(nextViewId)
        ];

        console.debug('service:drilldown-manager.drillDown', nextSteps);

        return nextSteps;
    },

    buildViewFilter(steps, timeWindow) {
        let viewId = null;
        let filter = null;

        if (Ember.isEmpty(steps)) {
            viewId = VIEW_ID_OVERVIEW;
        } else if (steps.length === 1) {
            viewId = steps[steps.length - 1].viewId;
        } else {
            // the current step needs to previous one's filter
            // remember that each step's filter always includes the entire drilldown filter
            filter = steps[steps.length - 2].filter;
            viewId = steps[steps.length - 1].viewId;
        }

        let completeFilter = null;
        switch (viewId) {
            case 'dig':
                if (Ember.isNone(filter)) {
                    completeFilter = 'evt.type != switch';
                } else {
                    completeFilter = `evt.type != switch and ${filter}`;
                }
                break;
            default:
                completeFilter = filter;
        }

        let viewFilter = null;
        if (Ember.isNone(timeWindow) === false) {
            const timeFilter = `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to}`;
            const timeFilterRegex = /evt.rawtime >= \d+ and evt.rawtime <= \d+/;
            if (Ember.isNone(completeFilter) === false && completeFilter.search(timeFilterRegex) >= 0) {
                viewFilter = completeFilter.replace(timeFilterRegex, timeFilter);
            } else if (Ember.isNone(completeFilter) === false) {
                viewFilter = `${timeFilter} and (${completeFilter})`;
            } else {
                viewFilter = timeFilter;
            }
        } else {
            viewFilter = completeFilter;
        }

        console.debug('service:drilldown-manager.buildViewFilter', viewFilter);

        return viewFilter;
    },
});

class DrilldownStep {
    constructor(viewId, key = null, selection = null, filter = null) {
        this.viewId = viewId;
        this.key = key;
        this.selection = selection;
        this.filter = filter ? filter.replace(FILTER_TEMPLATE_KEY_PLACEHOLDER, selection) : null;
    }
}

class DrilldownUrlInfo {
    constructor(viewId, steps = null) {
        this.viewId = viewId;
        this.drilldownInfoParam = this.serializeSteps(steps);

        console.debug('DrilldownUrlInfo.constructor', this);
    }

    serializeSteps(steps) {
        return JSON.stringify(steps);
    }

    static deserializeSteps(drilldownInfoParam) {
        let deserialized = JSON.parse(drilldownInfoParam)
            .map((step) => new DrilldownStep(step.viewId, step.key, step.selection, step.filter))
        ;

        if (deserialized.length === 0 || deserialized[0].viewId !== 'overview') {
            // enforce Overview to be the first step of the navigation at all times
            deserialized = [
                new DrilldownStep('overview'),
                ...deserialized
            ];
        }

        console.debug('DrilldownUrlInfo.deserializeSteps', deserialized);

        return deserialized;
    }
}
