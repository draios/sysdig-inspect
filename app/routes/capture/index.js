import Ember from 'ember';

export default Ember.Route.extend({
    drilldownManager: Ember.inject.service('drilldown-manager'),

    beforeModel() {
        const captureModel = this.modelFor('capture');

        if (captureModel.queryParams.drilldownInfoParam) {
            const steps = this.get('drilldownManager').convertFromUrl({
                drilldownInfoParam: captureModel.queryParams.drilldownInfoParam,
            });

            if (Ember.isEmpty(steps)) {
                this.replaceWith('capture.overview', {
                    queryParams: Object.assign({}, captureModel.queryParams),
                });
            } else {
                const currentStep = steps[steps.length - 1];
                if (currentStep.viewId === 'overview') {
                    this.replaceWith('capture.overview', {
                        queryParams: Object.assign({}, captureModel.queryParams),
                    });
                } else {
                    this.replaceWith('capture.views.view', currentStep.viewId, {
                        queryParams: Object.assign({}, captureModel.queryParams),
                    });
                }
            }
        } else {
            this.replaceWith('capture.overview', {
                queryParams: Object.assign({}, captureModel.queryParams),
            });
        }
    },
});
