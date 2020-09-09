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
import layout from '../templates/components/wsd-capture-overview';

const IS_CATEGORY_LAYOUT = true;
const IS_VERTICAL_LAYOUT = true;

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-overview', 'wsd-capture-overview--xlist'],
    classNameBindings: ['isVerticalLayout:wsd-capture-overview--is-vertical-layout'],

    captureSummaryDataService: Ember.inject.service('fetch-capture-summary'),
    captureTimelines: Ember.inject.service('capture-timelines'),
    drilldownManager: Ember.inject.service('drilldown-manager'),
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    filePath: null,
    timelines: null,
    timeWindow: null,
    filter: null,
    drilldownInfoParam: null,
    toggleMetricTimeline: null,

    selectedMetric: null,

    drilldownInfo: Ember.computed('drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            viewId: 'overview',
            drilldownInfoParam: this.get('drilldownInfoParam'),
        });
    }).readOnly(),

    sampleCount: Ember.computed(function() {
        const timelinesWidth = 150;

        if (timelinesWidth) {
            const sampleCount = Math.round(timelinesWidth / (3 * 1.4));
            const possibleSampleCount = [4, 5, 8, 10, 16, 20, 25, 40, 50, 80, 100, 200, 400];

            if (sampleCount <= possibleSampleCount[0]) {
                return possibleSampleCount[0];
            } else if (sampleCount >= possibleSampleCount[possibleSampleCount.length - 1]) {
                return possibleSampleCount[possibleSampleCount.length - 1];
            } else {
                return possibleSampleCount.filter((c) => c >= sampleCount)[0];
            }
        } else {
            return 0;
        }
    }).readOnly(),

    dataStore: Ember.computed('filePath', 'sampleCount', 'timeWindow', 'filter', function() {
        return this.get('captureSummaryDataService').fetch(
            this,
            this.get('filePath'),
            this.get('sampleCount'),
            this.get('timeWindow'),
            this.get('filter'),
        );
    }).readOnly(),

    timelinesData: Ember.computed('timelines', 'dataStore.metrics', function() {
        const timelines = this.get('timelines');
        const metrics = this.get('dataStore.metrics');

        if (Ember.isEmpty(metrics) === false && Ember.isEmpty(timelines) === false) {
            return timelines.map((metricName) => metrics.findBy('name', metricName));
        } else {
            return null;
        }
    }).readOnly(),

    metricsData: Ember.computed('captureTimelines.timelines', 'dataStore.metrics', 'selectedMetric', function() {
        const timelines = this.get('captureTimelines.timelines');
        const metrics = this.get('dataStore.metrics');
        const selectedMetric = this.get('selectedMetric');

        if (Ember.isEmpty(metrics) === false) {
            return metrics.map((metric) => {
                return {
                    data: metric,
                    isSelected: metric.name === selectedMetric,
                    isTimelinePinned: timelines.includes(metric.name),
                };
            });
        } else {
            return null;
        }
    }).readOnly(),

    isCategoryLayout: IS_CATEGORY_LAYOUT,
    isVerticalLayout: IS_VERTICAL_LAYOUT,

    categories: Ember.computed('dataStore.info.categories', 'metricsData', function() {
        const categoryConfigurations = this.get('dataStore.info.categories');
        const metricsData = this.get('metricsData');

        if (Ember.isEmpty(categoryConfigurations) === false && Ember.isEmpty(metricsData) === false) {
            const categories = categoryConfigurations.map((category) => ({
                id: category.id,
                name: category.name,
                metricsData: [],
            }));

            metricsData.forEach((metric) => {
                categories.findBy('id', metric.data.category).metricsData.push(metric);
            });

            return categories;
        } else {
            return null;
        }
    }).readOnly(),

    didInsertElement() {
        this.get('shortcutsService').bind(
            'navigation.drillDown',
            () => {
                const metricsData = this.get('metricsData').filterBy('isSelected', true);
                if (Ember.isEmpty(metricsData) === false) {
                    this.send('drillDown', metricsData[0].data.name);
                }

                return false;
            }
        );
        this.get('shortcutsService').bind(
            'overview.toggleTimeline',
            () => {
                if (Ember.isNone(this.get('selectedMetric')) === false) {
                    this.send('toggleMetricTimeline', this.get('selectedMetric'));
                }

                return false;
            }

        );
        this.get('shortcutsService').bind(
            'overview.selectLeft',
            () => {
                const categories = this.get('categories');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = this.get('metricsData').findBy('data.name', selection);
                    const selectedCategory = categories.findBy('id', selectedItem.data.category);
                    const categoryItemIndex = selectedCategory.metricsData.indexOf(selectedItem);
                    const items = categories
                        .map((category) => category.metricsData[categoryItemIndex])
                        .filter((metric) => metric !== undefined)
                    ;

                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === 0) {
                        this.send('select', items[items.length - 1].data.name);
                    } else {
                        this.send('select', items[itemIndex - 1].data.name);
                    }
                } else {
                    this.send('select', this.get('metricsData')[this.get('metricsData').length - 1].data.name);
                }

                return false;
            }
        );
        this.get('shortcutsService').bind(
            'overview.selectRight',
            () => {
                const categories = this.get('categories');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = this.get('metricsData').findBy('data.name', selection);
                    const selectedCategory = categories.findBy('id', selectedItem.data.category);
                    const categoryItemIndex = selectedCategory.metricsData.indexOf(selectedItem);
                    const items = categories
                        .map((category) => category.metricsData[categoryItemIndex])
                        .filter((metric) => metric !== undefined)
                    ;

                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === items.length - 1) {
                        this.send('select', items[0].data.name);
                    } else {
                        this.send('select', items[itemIndex + 1].data.name);
                    }
                } else {
                    this.send('select', this.get('metricsData')[0].data.name);
                }

                return false;
            }
        );
        this.get('shortcutsService').bind(
            'overview.selectDown',
            () => {
                const items = this.get('metricsData');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = items.findBy('data.name', selection);
                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === items.length - 1) {
                        this.send('select', items[0].data.name);
                    } else {
                        this.send('select', items[itemIndex + 1].data.name);
                    }
                } else {
                    this.send('select', items[0].data.name);
                }

                return false;
            }
        );
        this.get('shortcutsService').bind(
            'overview.selectUp',
            () => {
                const items = this.get('metricsData');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = items.findBy('data.name', selection);
                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === 0) {
                        this.send('select', items[items.length - 1].data.name);
                    } else {
                        this.send('select', items[itemIndex - 1].data.name);
                    }
                } else {
                    this.send('select', items[items.length - 1].data.name);
                }

                return false;
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('navigation.drilldown');
        this.get('shortcutsService').unbind('overview.toggleTimeline');
        this.get('shortcutsService').unbind('overview.selectLeft');
        this.get('shortcutsService').unbind('overview.selectRight');
        this.get('shortcutsService').unbind('overview.selectDown');
        this.get('shortcutsService').unbind('overview.selectUp');
    },

    actions: {
        drillDown(metricName) {
            const metric = this.get('metricsData').findBy('data.name', metricName);
            const drilldownManager = this.get('drilldownManager');
            const drilldownInfo = drilldownManager.drillDown(
                this.get('drilldownInfo'),
                metric.data.drillDownKeyField,
                metricName,
                metric.data.targetViewFilter,
                metric.data.targetView
            );
            this.sendAction('drillDown', drilldownManager.convertToUrl(drilldownInfo));
        },

        toggleMetricTimeline(metricName) {
            this.sendAction('toggleMetricTimeline', metricName);
        },

        select(metricName) {
            this.set('selectedMetric', metricName);
        },

        deselect() {
            this.set('selectedMetric', null);
        },
    },
});
