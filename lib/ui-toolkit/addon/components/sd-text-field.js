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

import TextField from '@ember/component/text-field';

export default TextField.extend({
    classNames: ['sd-text-field'],

    oneWayValue: null,

    init() {
        this._super(...arguments);

        this.set('value', this.get('oneWayValue'));
    },

    didUpdateAttrs() {
        this.set('value', this.get('oneWayValue'));
    },

    _elementValueDidChange() {
        this._super(...arguments);

        if (this.get('value') !== this.get('oneWayValue')) {
            this.sendAction('changeValue', this.get('value'));
        }
    },
});
