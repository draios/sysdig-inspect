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

export function numberToString([value], namedArgs) {
    if (Ember.typeOf(value) !== 'number') {
        return value;
    } else {
        let i;
        let multiplierSymbols;
        let multipliers;

        switch (namedArgs.dataType) {
            case 'relativeTime': {
                multiplierSymbols = ['ns', 'us', 'ms', 's', 'min', 'h', 'd'];
                multipliers = [1000, 1000, 1000, 60, 60, 24];
            } break;

            default: {
                multiplierSymbols = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
                multipliers = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];

            } break;
        }

        const step = 1;
        const decimalCount = namedArgs.decimalCount || 2;

        const absValue = Math.abs(value);

        let multiplier = 1;
        for (i = 0; i < multiplierSymbols.length; i++) {
            if (absValue < multiplier * step * multipliers[0]) {
                break;
            } else if (i < multiplierSymbols.length - 1) {
                multiplier = multiplier * multipliers[0];
            }
        }

        const convertedValue = value / multiplier;
        const multiplierSymbol = multiplierSymbols[i];

        const truncatedValue = convertedValue % 1 === 0 ? convertedValue : convertedValue.toFixed(decimalCount);

        let multiplierSymbolString;
        if (value === 0) {
            multiplierSymbolString = '';
        } else {
            multiplierSymbolString = namedArgs.isMultiplierOmitted === true ? '' : ` ${multiplierSymbol}`;
        }

        const valueString = namedArgs.isValueOmitted === true ? '' : ` ${truncatedValue}`;

        if (namedArgs.op) {
            return `${valueString}${multiplierSymbolString} ${namedArgs.op}`;
        } else {
            return `${valueString}${multiplierSymbolString}`;
        }
    }
}

export default Ember.Helper.helper(numberToString);
