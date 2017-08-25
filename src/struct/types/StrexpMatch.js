const Type = require('./Type');

class StrexpMatch extends Type {
    constructor(value) {
        if (!Array.isArray(value)) {
            throw new TypeError('`value` must be a match array');
        }

        if (typeof value.index !== 'number' && typeof value.input !== 'string') {
            throw new TypeError('`value` must be a match array');
        }

        super(value);
    }

    *iterator() {
        for (let i = 0; i < this.value.length; i++) {
            yield [new StrexpString(i), new StrexpString(this.value[i])];
        }
    }

    get property_at() {
        return new SystemLambda(1, 1, (node, index) => {
            this.checkIndex(node, index);
            return new StrexpString(this.value[index.value]);
        });
    }

    get property_length() {
        return new StrexpString(this.value.length);
    }

    get property_input() {
        return new StrexpString(this.value.input);
    }

    get property_index() {
        return new StrexpString(this.value.index);
    }

    get property_match() {
        return new StrexpString(this.value[0]);
    }

    get property_groups() {
        return new SystemLambda(0, 0, () => {
            const groups = this.value.slice(1).map(group => new StrexpString(group));
            return new StrexpArray(groups);
        });
    }

    checkIndex(node, index, inclusiveUpper) {
        if (!(index instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', index, 'usable as an index');
        }

        if (!Util.isInteger(index.value)) {
            throw error(node, 'VALUE_NOT_USABLE', index.value, 'a valid index');
        }

        if (inclusiveUpper) {
            if (Number(index.value) > this.value.length) {
                throw error(node, 'OUT_OF_RANGE', index.value);
            }
        } else
        if (this.value[index.value] === undefined) {
            throw error(node, 'OUT_OF_RANGE', index.value);
        }
    }
}

module.exports = StrexpMatch;

const Util = require('../Util');
const error = require('../Errors');

const StrexpArray = require('./StrexpArray');
const StrexpString = require('./StrexpString');

const SystemLambda = require('./lambdas/SystemLambda');
