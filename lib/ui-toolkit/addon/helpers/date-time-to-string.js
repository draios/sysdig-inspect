import Ember from 'ember';
import moment from 'moment';

export function dateTimeToString([value], namedArgs) {
    const numericValue = namedArgs.dataType === 'string' ? Number(value) : value;
    let ms;
    switch (namedArgs.unit) {
        case 'ns':
            ms = numericValue / 1000000;
            break;
        default:
            ms = numericValue;
            break;
    }

    return moment(ms).format('h:mm:ss.SSS a');
}

export default Ember.Helper.helper(dateTimeToString);
