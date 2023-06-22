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

import { debounce } from '@ember/runloop';

import { or } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/sd-input';

export default Component.extend({
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

    normValue: computed('value', function() {
        if (isEmpty(this.get('value'))) {
            return '';
        } else {
            return this.get('value');
        }
    }).readOnly(),

    isChangeFeedbackNeeded: or('isAcceptChangeMode', 'isDebounceChangeMode').readOnly(),
    isChangeFeedbackVisible: computed('isChanged', 'isAccepted', function() {
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
            this.sendAction('cancel');

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
        debounce(this, acceptValue, value, 300);
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
