import Ember from 'ember';
import layout from '../templates/components/sd-input';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-input'],
    attributeBindings: ['tabIndex'],

    tabIndex: -1,

    value: '',
    placeholder: null,

    prevValue: '',
    changingValue: '',

    isDefaultChangeMode: false,
    isAcceptChangeMode: false,
    isDebounceChangeMode: false,

    isChanged: false,
    isAccepted: false,

    normValue: Ember.computed('value', function() {
        if (Ember.isEmpty(this.get('value'))) {
            return '';
        } else {
            return this.get('value');
        }
    }).readOnly(),

    isChangeFeedbackNeeded: Ember.computed.or('isAcceptChangeMode', 'isDebounceChangeMode').readOnly(),
    isChangeFeedbackVisible: Ember.computed('isChanged', 'isAccepted', function() {
        return this.get('isChanged') || this.get('isAccepted');
    }).readOnly(),

    init() {
        this._super(...arguments);

        this.set('changingValue', this.get('normValue'));
    },

    didUpdateAttrs() {
        if (this.get('normValue') !== this.get('prevValue')) {
            didUpdateValue.call(this, this.get('normValue'));
            this.set('prevValue', this.get('normValue'));
        }
    },

    actions: {
        changeValue(value) {
            changeValue.call(this, value);
        },
        accept() {
            acceptValue.call(this, this.get('changingValue'));
        },
        cancel() {
            changeValue.call(this, '');
        },
    },
});

function didUpdateValue(value) {
    this.setProperties({
        isChanged: false,
        isAccepted: true,
        changingValue: value,
    });
}

function changeValue(value) {
    if (this.get('isAcceptChangeMode')) {
        this.setProperties({
            isChanged: value !== this.get('normValue'),
            isAccepted: value === this.get('normValue'),
            changingValue: value,
        });
    } else if (this.get('isDebounceChangeMode')) {
        this.setProperties({
            changingValue: value,
        });
        Ember.run.debounce(this, acceptValue, value, 300);
    } else {
        this.acceptValue();
    }
}

function acceptValue(value) {
    if (this.get('isAcceptChangeMode')) {
        if (this.get('normValue') !== value) {
            this.sendAction('changeValue', value);
        }
    } else if (this.get('isDebounceChangeMode')) {
        if (this.get('normValue') !== value) {
            this.sendAction('changeValue', value);
        }
    } else {
        if (this.get('normValue') !== value) {
            this.sendAction('changeValue', value);
        }
    }
}
