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

export default Ember.Route.extend({
    drilldownManager: Ember.inject.service('drilldown-manager'),

    beforeModel() {
        const captureModel = this.modelFor('capture');

        if (captureModel.queryParams.drilldownInfoParam) {
            const steps = this.get('drilldownManager').convertFromUrl({
                drilldownInfoParam: captureModel.queryParams.drilldownInfoParam,
            });

            if (Ember.isEmpty(steps)) {
                this.replaceWith('capture.views.view', 'overview', {
                    queryParams: Object.assign({}, captureModel.queryParams),
                });
            } else {
                const currentStep = steps[steps.length - 1];
                this.replaceWith('capture.views.view', currentStep.viewId, {
                    queryParams: Object.assign({}, captureModel.queryParams),
                });
            }
        } else {
            this.replaceWith('capture.views.view', 'overview', {
                queryParams: Object.assign({}, captureModel.queryParams),
            });
        }
    },
});
