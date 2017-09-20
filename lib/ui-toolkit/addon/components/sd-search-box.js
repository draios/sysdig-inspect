import Ember from 'ember';
import layout from '../templates/components/sd-search-box';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-search-box'],
    attributeBindings: ['tabIndex'],

    dataSearchService: Ember.inject.service('data-search'),

    tabIndex: -1,

    placeholder: null,

    prevValue: '',
    changingValue: '',

    value: Ember.computed.readOnly('dataSearchService.searchDataStore.searchPattern'),

    normValue: Ember.computed('value', function() {
        if (Ember.isEmpty(this.get('value'))) {
            return '';
        } else {
            return this.get('value');
        }
    }).readOnly(),

    currentMatchIndex: Ember.computed('dataSearchService.searchDataStore.selectedMatchIndex', function() {
        return this.get('dataSearchService.searchDataStore.selectedMatchIndex') + 1;
    }).readOnly(),

    matchCount: Ember.computed.readOnly('dataSearchService.searchDataStore.matchCount'),

    isChangeFeedbackNeeded: true,
    isChangeFeedbackVisible: false,

    init() {
        this._super(...arguments);

        this.set('changingValue', this.get('normValue'));
        this.get('dataSearchService').on('didChangeSearchPattern', this, this.didChangeSearchPattern);
    },

    willDestroyElement() {
        this.get('dataSearchService').off('didChangeSearchPattern', this, this.didChangeSearchPattern);
    },

    didChangeSearchPattern() {
        didUpdateValue.call(this, this.get('normValue'));
    },

    actions: {
        changeValue(value) {
            changeValue.call(this, value);
        },
        cancel() {
            this.sendAction('cancel');

            changeValue.call(this, '');
        },
        keyDown(value, e) {
            if (e.key === 'Enter') {
                if (e.shiftKey === false) {
                    if (this.get('normValue') !== value) {
                        acceptValue.call(this, this.get('changingValue'));
                    } else {
                        this.get('dataSearchService').selectNextMatch();
                    }
                } else {
                    this.get('dataSearchService').selectPreviousMatch();
                }
            }
        },
    },
});

function didUpdateValue(value) {
    this.setProperties({
        changingValue: value,
    });
}

function changeValue(value) {
    this.setProperties({
        changingValue: value,
    });
    Ember.run.debounce(this, acceptValue, value, 300);
}

function acceptValue(value) {
    if (this.isDestroying || this.isDestroyed) {
        return;
    }

    if (this.get('normValue') !== value) {
        this.sendAction('changeValue', value);
    }
}
