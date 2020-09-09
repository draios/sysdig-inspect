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
import layout from '../templates/components/wsd-metric-timelines';
import nanoseconds from 'ui-toolkit/utils/nanoseconds';

const TIME_SERIES_HEIGHT = 30;
const LAYOUT_SPACING_SM = 8;
const TIMELINE_HEIGHT = TIME_SERIES_HEIGHT + LAYOUT_SPACING_SM;
const TIMELINE_DRAGGABLE_HANDLE_WIDTH = 10;

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-metric-timelines'],
    attributeBindings: ['style'],

    filePath: null,
    timelines: null,

    captureSummaryDataService: Ember.inject.service('fetch-capture-summary'),
    layoutProvider: Ember.inject.service('layout-provider'),
    colorProvider: Ember.inject.service('color-provider'),

    timelinesWidth: 0,
    timeSeriesHeight: TIME_SERIES_HEIGHT,
    canRenderTimelines: false,

    timeWindow: null,
    filter: null,

    hoverTimestamp: null,
    isMouseOver: false,

    captureTimeWindow: Ember.computed('captureInfo', function() {
        const captureInfo = this.get('captureInfo');

        if (Ember.isEmpty(captureInfo) === false) {
            return {
                from: captureInfo.from,
                to: captureInfo.to,
            };
        } else {
            return {
                from: null,
                to: null,
            };
        }
    }),

    selectedTimeWindow: Ember.computed('timeWindow', 'captureTimeWindow', function() {
        if (this.get('timeWindow')) {
            return this.get('timeWindow');
        } else {
            return this.get('captureTimeWindow');
        }
    }).readOnly(),

    hasSelection: Ember.computed('captureTimeWindow', 'selectedTimeWindow', function() {
        return this.get('captureTimeWindow.from') !== this.get('selectedTimeWindow.from') ||
            this.get('captureTimeWindow.to') !== this.get('selectedTimeWindow.to')
        ;
    }).readOnly(),

    timeline: Ember.computed('summaryDataStore.metrics', function() {
        const metrics = this.get('summaryDataStore.metrics');

        if (Ember.isEmpty(metrics) === false) {
            const firstTimeSeries = metrics[0].timeSeries;
            return firstTimeSeries.mapBy('t');
        } else {
            return null;
        }
    }).readOnly(),

    sampleCount: Ember.computed('timelinesWidth', function() {
        const timelinesWidth = this.get('timelinesWidth');

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

    summaryDataStore: Ember.computed('filePath', 'sampleCount', 'filter', function() {
        const sampleCount = this.get('sampleCount');

        if (sampleCount > 0) {
            return this.get('captureSummaryDataService').fetch(this, this.get('filePath'), sampleCount, null, this.get('filter'));
        } else {
            return null;
        }
    }).readOnly(),

    timelinesData: Ember.computed('timelines', 'summaryDataStore.metrics', function() {
        const timelines = this.get('timelines');
        const metrics = this.get('summaryDataStore.metrics');

        if (Ember.isEmpty(timelines) === false && Ember.isEmpty(metrics) === false) {
            return timelines.map((metricName) => metrics.findBy('name', metricName));
        } else {
            return timelines.map((metricName) => ({ name: metricName }));
        }
    }).readOnly(),

    captureInfo: Ember.computed.readOnly('summaryDataStore.info'),

    timelinesConfiguration: Ember.computed('timelinesData', 'hoverTimestamp', function() {
        const hoverTimestamp = this.get('hoverTimestamp');

        return this.get('timelinesData')
            .map((timeline) => {
                const color = this.get('colorProvider').getColor(timeline.name, 'OVERVIEW_METRIC');

                return {
                    timeline,
                    offsetY: LAYOUT_SPACING_SM,
                    color,
                    markerStyle: Ember.String.htmlSafe(`background-color: ${color};`),
                    hoverValue: hoverTimestamp ? timeline.timeSeries.findBy('t', hoverTimestamp) : null,
                };
            })
        ;
    }).readOnly(),

    timelinesHeight: Ember.computed('timelines.length', function() {
        return TIMELINE_HEIGHT;
    }).readOnly(),

    overlayHeight: Ember.computed('timelines.length', function() {
        return TIMELINE_HEIGHT * (this.get('timelines.length') + 1);
    }).readOnly(),

    overlayStyle: Ember.computed('timelinesWidth', function() {
        return Ember.String.htmlSafe(`width: ${this.get('timelinesWidth') + TIMELINE_DRAGGABLE_HANDLE_WIDTH * 2}px;`);
    }).readOnly(),

    hoverTimestampRelative: Ember.computed('hoverTimestamp', 'captureTimeWindow', function() {
        const hoverTimestamp = this.get('hoverTimestamp');
        const captureFrom = this.get('captureTimeWindow.from');

        if (Ember.isNone(hoverTimestamp) === false && captureFrom !== null) {
            return nanoseconds(hoverTimestamp)
                .diff(nanoseconds(captureFrom))
                .toNumber()
            ;
        } else {
            return 0;
        }
    }).readOnly(),

    // style: Ember.computed('timelines.length', function() {
    //     const height = TIMELINE_HEIGHT * (this.get('timelines.length') + 1);
    //     return Ember.String.htmlSafe(`height: ${height}px`);
    // }).readOnly(),

    init() {
        this._super(...arguments);

        this.get('layoutProvider').onLayoutChanged(this, this.calculateTimelinesSize);
    },

    willDestroyElement() {
        this.get('layoutProvider').offLayoutChanged(this, this.calculateTimelinesSize);
    },

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.calculateTimelinesSize());
    },

    didUpdateAttrs() {
        this.get('layoutProvider').whenSettled(() => this.calculateTimelinesSize());
    },

    calculateTimelinesSize() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        const elTimeSeries = document.querySelector(`#${this.get('elementId')} .wsd-metric-timelines__content`);
        const computedStyle = elTimeSeries.getBoundingClientRect();
        this.setProperties({
            timelinesWidth: computedStyle.width - TIMELINE_DRAGGABLE_HANDLE_WIDTH * 2,
            canRenderTimelines: true,
        });
    },

    mouseEnter() {
        this.set('isMouseOver', true);
    },

    mouseLeave() {
        this.setProperties({
            isMouseOver: false,
            hoverTimestamp: null,
        });
    },

    actions: {
        hoverTimestamp(timestamp) {
            this.set('hoverTimestamp', timestamp);
        },
    },
});
