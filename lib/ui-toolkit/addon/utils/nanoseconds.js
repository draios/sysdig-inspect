export default function parse(value) {
    return new Nanoseconds(value);
}

class Nanoseconds {
    constructor(value) {
        this.value = value;
    }

    diff(value) {
        const a = String(this.value);
        const b = String(value.value);

        // NOTE: timestamps are stored as strings, for the nanosecond precision
        let i;
        for (i = a.length - 1; i >= 0 && b.indexOf(a.substring(0, i)); i--) {
            // noop
        }

        const bNs = Number(b.substring(i));
        const aNs = Number(a.substring(i));
        return new Nanoseconds(aNs - bNs);
    }

    add(value) {
        const a = this.value.split('').map((d) => Number.parseInt(d)).reverse();
        const b = value.toString().split('').map((d) => Number.parseInt(d)).reverse();

        // vvv - currently based on https://github.com/peterolson/BigInteger.js/blob/979795b450bcbc9d1d06accb6ab57417501edb08/BigInteger.js#L76-L95
        const lengthA = a.length;
        const lengthB = b.length;
        const r = new Array(lengthA);
        const base = 10;
        let carry = 0;
        let sum;
        let i;

        for (i = 0; i < lengthB; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }

        while (i < lengthA) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }

        if (carry > 0) {
            r.push(carry);
        }
        // ^^^ - https://github.com/peterolson/BigInteger.js/blob/979795b450bcbc9d1d06accb6ab57417501edb08/BigInteger.js#L76-L95

        return new Nanoseconds(r.reverse().map((n) => n.toFixed()).join(''));
    }

    isGreaterThan(value) {
        return this.value.localeCompare(value.toString()) > 0;
    }

    isEqualTo(value) {
        return this.value === value.toString();
    }

    isLowerThan(value) {
        return this.value.localeCompare(value.toString()) < 0;
    }

    toNumber() {
        return Number(this.value);
    }

    toString() {
        return this.value;
    }
}
