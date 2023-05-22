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

import { isEmpty } from '@ember/utils';

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from '../templates/components/sd-list';
import scrollToSelection from '../utils/scroll-to-selection';

export default Component.extend({
    layout,
    classNames: ['sd-list'],

    layoutProvider: service('layout-provider'),

    items: null,
    selection: null,
    key: 'id',

    itemHeight: 36,

    itemsData: computed('items', 'selection', function() {
        const key = this.get('key');
        const selection = this.get('selection');

        return (this.get('items') || []).map((item) => {
            return {
                isSelected: get(item, key) === selection,
                data: item,
            };
        });
    }).readOnly(),

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.scrollToSelection());
    },

    didUpdateAttrs() {
        if (this.get('selection') !== this.get('prevSelection')) {
            this.get('layoutProvider').whenSettled(() => this.scrollToSelection());
            this.set('prevSelection', this.get('selection'));
        }
    },

    scrollToSelection() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        const items = this.get('items');
        const selection = this.get('selection');

        if (isEmpty(items) || isEmpty(selection)) {
            return;
        }

        const key = this.get('key');
        let indexOfSelection;
        let i;
        let iz;
        for (i = 0, iz = get(items, 'length'); i < iz; i++) {
            if (get(items[i], key) === selection) {
                indexOfSelection = i;
                break;
            }
        }

        if (indexOfSelection === undefined) {
            return;
        }

        scrollToSelection({
            container: this.get('element'),
            index: indexOfSelection,
            itemHeight: this.get('itemHeight'),
            paddingTop: 16,
        });
    },
});
