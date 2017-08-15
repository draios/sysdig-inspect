import Ember from 'ember';

export function numberToString([value]) {
    if (Ember.typeOf(value) !== 'number') {
        return value;
    } else {
        const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        const multipliers = [1000];
        const step = 1;
        const decimalCount = 2;

        const absValue = Math.abs(value);
        let i;
        let multiplier = 1;

        for (i = 0; i < units.length; i++) {
            if (absValue < multiplier * step * multipliers[0]) {
                break;
            } else if (i < units.length - 1) {
                multiplier = multiplier * multipliers[0];
            }
        }

        const convertedValue = value / multiplier;
        const unit = units[i];

        const truncatedValue = convertedValue % 1 === 0 ? convertedValue : convertedValue.toFixed(decimalCount);

        return `${truncatedValue} ${unit}`;
    }
}

export default Ember.Helper.helper(numberToString);
