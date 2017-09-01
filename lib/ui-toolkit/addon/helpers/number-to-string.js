import Ember from 'ember';

export function numberToString([value], namedArgs) {
    if (Ember.typeOf(value) !== 'number') {
        return value;
    } else {
        const multiplierSymbols = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        const multipliers = [1000];
        const step = 1;
        const decimalCount = namedArgs.decimalCount || 2;

        const absValue = Math.abs(value);
        let i;
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

        if (namedArgs.type) {
            return `${truncatedValue} ${multiplierSymbol} ${namedArgs.type}`;
        } else {
            return `${truncatedValue} ${multiplierSymbol}`;
        }
    }
}

export default Ember.Helper.helper(numberToString);
