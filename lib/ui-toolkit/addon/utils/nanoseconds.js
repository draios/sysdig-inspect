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

    toNumber() {
        return Number(this.value);
    }
}
