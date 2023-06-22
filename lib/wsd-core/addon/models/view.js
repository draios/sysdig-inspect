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

import { computed } from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    description: DS.attr(),
    drilldownTarget: DS.attr(),
    appliesTo: DS.attr({ defaultValue: [] }),
    tags: DS.attr(),
    filter: DS.attr(),

    isForSysdigInspect: computed('tags', function() {
        return isEmpty(this.get('tags')) === false && this.get('tags').includes('wsysdig');
    }).readOnly(),
});
