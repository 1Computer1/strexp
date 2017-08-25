const Type = require('./Type');

class StrexpArray extends Type {
    constructor(value) {
        if (!Array.isArray(value)) {
            throw new TypeError('`value` must be an array');
        }

        super(value);
    }

    *iterator() {
        for (let i = 0; i < this.value.length; i++) {
            yield [new StrexpString(i), this.value[i]];
        }
    }

    get property_at() {
        return new SystemLambda(1, 1, (node, index) => {
            this.checkIndex(node, index);
            return this.value[index.value];
        });
    }

    get property_concat() {
        return new SystemLambda(1, Infinity, (node, ...arrays) => {
            return new StrexpArray(arrays.reduce((res, curr) => {
                if (!(curr instanceof StrexpArray)) {
                    throw error(node, 'TYPE_NOT_USABLE', curr, 'concatenatable');
                }

                return res.concat(curr.value);
            }, this.value));
        });
    }

    get property_length() {
        return new StrexpString(this.value.length);
    }

    get property_set() {
        return new SystemLambda(2, 2, (node, index, newValue) => {
            this.checkIndex(node, index);
            this.value[index.value] = newValue;
            return this;
        });
    }

    get property_insert() {
        return new SystemLambda(2, 2, (node, index, insertValue) => {
            this.checkIndex(node, index, true);
            this.value.splice(Number(index.value), 0, insertValue);
            return this;
        });
    }

    get property_remove() {
        return new SystemLambda(1, 1, (node, index) => {
            this.checkIndex(node, index, false);
            this.value.splice(Number(index.value), 1);
            return this;
        });
    }

    get property_push() {
        return new SystemLambda(1, Infinity, (node, ...items) => {
            return new StrexpString(this.value.push(...items));
        });
    }

    get property_pop() {
        return new SystemLambda(0, 0, node => {
            if (this.value.length === 0) {
                throw error(node, 'ARRAY_NO_POP');
            }

            return this.value.pop();
        });
    }

    get property_shift() {
        return new SystemLambda(0, 0, node => {
            if (this.value.length === 0) {
                throw error(node, 'ARRAY_NO_SHIFT');
            }

            return this.value.shift();
        });
    }

    get property_unshift() {
        return new SystemLambda(1, Infinity, (node, ...items) => {
            return new StrexpString(this.value.unshift(...items));
        });
    }

    get property_reverse() {
        return new SystemLambda(0, 0, () => {
            this.value.reverse();
            return this;
        });
    }

    get property_index() {
        return new SystemLambda(1, 1, (node, callback) => {
            if (!(callback instanceof BaseLambda)) {
                throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
            }

            const found = this.value.findIndex((item, i) => {
                const args = [item, new StrexpString(i)].slice(0, callback.maxArgs);
                const ret = callback.call(node, args);
                return ret !== null;
            });

            if (found > -1) return new StrexpString(found);
            return null;
        });
    }

    get property_map() {
        return new SystemLambda(1, 1, (node, callback) => {
            if (!(callback instanceof BaseLambda)) {
                throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
            }

            const arr = this.value.map((item, i) => {
                const args = [item, new StrexpString(i)].slice(0, callback.maxArgs);
                return callback.call(node, args);
            });

            return new StrexpArray(arr);
        });
    }

    get property_filter() {
        return new SystemLambda(1, 1, (node, callback) => {
            if (!(callback instanceof BaseLambda)) {
                throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
            }

            const arr = this.value.filter((item, i) => {
                const args = [item, new StrexpString(i)].slice(0, callback.maxArgs);
                const ret = callback.call(node, args);
                return ret !== null;
            });

            return new StrexpArray(arr);
        });
    }

    get property_reduce() {
        return new SystemLambda(1, 2, (node, callback, accum) => {
            if (!(callback instanceof BaseLambda)) {
                throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
            }

            if (accum === undefined && this.value.length === 0) {
                throw error(node, 'ARRAY_NO_REDUCE');
            }

            const reducer = (res, curr, i) => {
                const args = [res, curr, new StrexpString(i)].slice(0, callback.maxArgs);
                const ret = callback.call(node, args);
                return ret;
            };

            return accum !== undefined
                ? this.value.reduce(reducer, accum)
                : this.value.reduce(reducer);
        });
    }

    get property_slice() {
        return new SystemLambda(1, 2, (node, start, end = new StrexpString(this.value.length)) => {
            this.checkIndex(node, start);
            this.checkIndex(node, end, true);
            const arr = this.value.slice(Number(start.value), Number(end.value));
            return new StrexpArray(arr);
        });
    }

    get property_clone() {
        return new SystemLambda(0, 0, () => {
            return new StrexpArray(this.value.slice(0));
        });
    }

    get property_extend() {
        return new SystemLambda(1, Infinity, (node, ...arrays) => {
            for (const arr of arrays) {
                if (!(arr instanceof StrexpArray)) {
                    throw error(node, 'TYPE_NOT_USABLE', arr, 'an array');
                }

                this.value.push(...arr.value);
            }

            return this;
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

module.exports = StrexpArray;

const Util = require('../Util');
const error = require('../Errors');

const StrexpString = require('./StrexpString');

const BaseLambda = require('./lambdas/BaseLambda');
const SystemLambda = require('./lambdas/SystemLambda');
