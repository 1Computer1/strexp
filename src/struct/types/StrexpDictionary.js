const Type = require('./Type');

class StrexpDictionary extends Type {
    constructor(value) {
        if (!(value instanceof Map)) {
            throw new TypeError('`value` must be a Map');
        }

        super(value);

        this.hidden = new Set();
        this.frozen = false;
        this.sealed = false;
    }

    *iterator() {
        let i = 0;
        for (const [key, value] of this.value) {
            if (this.hidden.has(key)) continue;
            yield [new StrexpString(i), new StrexpArray([new StrexpString(key), value])];
            i++;
        }
    }

    get property_size() {
        return new StrexpString(this.value.size - this.hidden.size);
    }

    get property_full_size() {
        return new StrexpString(this.value.size);
    }

    get property_keys() {
        return new SystemLambda(0, 0, () => {
            const keys = [];
            for (const key of this.value.keys()) {
                if (this.hidden.has(key)) continue;
                keys.push(key);
            }

            return new StrexpArray(keys);
        });
    }

    get property_hidden() {
        return new SystemLambda(0, 0, () => {
            return new StrexpArray(Array.from(this.hidden, e => new StrexpString(e)));
        });
    }

    get property_full_keys() {
        return new SystemLambda(0, 0, () => {
            const keys = Array.from(this.value.keys(), k => new StrexpString(k));
            return new StrexpArray(keys);
        });
    }

    get property_values() {
        return new SystemLambda(0, 0, () => {
            const values = [];
            for (const [key, value] of this.value) {
                if (this.hidden.has(key)) continue;
                values.push(value);
            }

            return new StrexpArray(values);
        });
    }

    get property_full_values() {
        return new SystemLambda(0, 0, () => {
            const values = Array.from(this.value.values());
            return new StrexpArray(values);
        });
    }

    get property_entries() {
        return new SystemLambda(0, 0, () => {
            const entries = [];
            for (const [key, value] of this.value) {
                if (this.hidden.has(key)) continue;
                entries.push(new StrexpArray([new StrexpString(key), value]));
            }

            return new StrexpArray(entries);
        });
    }

    get property_full_entries() {
        return new SystemLambda(0, 0, () => {
            const entries = [];
            for (const [key, value] of this.value) {
                entries.push(new StrexpArray([new StrexpString(key), value]));
            }

            return new StrexpArray(entries);
        });
    }

    get property_get() {
        return new SystemLambda(1, 2, (node, key, defaultValue = undefined) => {
            if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
                throw error(node, 'TYPE_NOT_USABLE', key, 'usable as a dictionary key');
            }

            key = key.value;

            if (!this.value.has(key)) {
                if (defaultValue === undefined) {
                    throw error(node, 'KEY_NOT_EXIST', key);
                }

                return defaultValue;
            }

            return this.value.get(key);
        });
    }

    get property_set() {
        return new SystemLambda(2, 2, (node, key, newValue) => {
            if (this.frozen) {
                throw error(node, 'FROZEN_DICTIONARY');
            }

            if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
                throw error(node, 'TYPE_NOT_USABLE', key, 'usable as a dictionary key');
            }

            key = key.value;

            if (this.sealed && !this.value.has(key)) {
                throw error(node, 'SEALED_DICTIONARY');
            }

            this.value.set(key, newValue);
            return this;
        });
    }

    get property_remove() {
        return new SystemLambda(1, 1, (node, key) => {
            if (this.frozen) {
                throw error(node, 'FROZEN_DICTIONARY');
            }

            if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
                throw error(node, 'TYPE_NOT_USABLE', key, 'usable as a dictionary key');
            }

            key = key.value;

            if (!this.value.has(key)) {
                throw error(node, 'KEY_NOT_EXIST', key);
            }

            if (this.sealed) {
                throw error(node, 'SEALED_DICTIONARY');
            }

            this.value.delete(key);
            return this;
        });
    }

    get property_clear() {
        return new SystemLambda(0, 0, node => {
            if (this.frozen) {
                throw error(node, 'FROZEN_DICTIONARY');
            }

            this.value.clear();
            return this;
        });
    }

    get property_hide() {
        return new SystemLambda(1, 1, (node, key) => {
            if (this.frozen) {
                throw error(node, 'FROZEN_DICTIONARY');
            }

            if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
                throw error(node, 'TYPE_NOT_USABLE', key, 'usable as a dictionary key');
            }

            key = key.value;

            if (!this.value.has(key)) {
                throw error(node, 'KEY_NOT_EXIST', key);
            }

            this.hidden.add(key);
            return this;
        });
    }

    get property_freeze() {
        return new SystemLambda(0, 0, () => {
            this.frozen = true;
            return this;
        });
    }

    get property_seal() {
        return new SystemLambda(0, 0, () => {
            this.sealed = true;
            return this;
        });
    }

    get property_clone() {
        return new SystemLambda(0, 0, () => {
            const dict = new StrexpDictionary(new Map());

            for (const [key, value] of this.value) {
                if (this.hidden.has(key)) continue;

                dict.value.set(key, value);
            }

            return dict;
        });
    }

    get property_clone_full() {
        return new SystemLambda(0, 0, () => {
            const dict = new StrexpDictionary(new Map());

            for (const [key, value] of this.value) {
                dict.value.set(key, value);
                if (this.hidden.has(key)) dict.hidden.add(key);
            }

            return dict;
        });
    }

    get property_extend() {
        return new SystemLambda(1, Infinity, (node, ...dicts) => {
            if (this.frozen) {
                throw error(node, 'FROZEN_DICTIONARY');
            }

            for (const dict of dicts) {
                if (!(dict instanceof StrexpDictionary)) {
                    throw error(node, 'TYPE_NOT_USABLE', dict, 'a dictionary');
                }

                for (const [k, v] of dict.value) {
                    if (this.sealed && !this.value.has(k)) continue;
                    if (dict.hidden.has(k)) continue;
                    this.value.set(k, v);
                }
            }

            return this;
        });
    }

    get property_extend_full() {
        return new SystemLambda(1, Infinity, (node, ...dicts) => {
            if (this.frozen) {
                throw error(node, 'FROZEN_DICTIONARY');
            }

            for (const dict of dicts) {
                if (!(dict instanceof StrexpDictionary)) {
                    throw error(node, 'TYPE_NOT_USABLE', dict, 'a dictionary');
                }

                for (const [k, v] of dict.value) {
                    if (this.sealed && !this.value.has(k)) continue;
                    this.value.set(k, v);
                    if (dict.hidden.has(k)) this.hidden.add(k);
                }
            }

            return this;
        });
    }
}

module.exports = StrexpDictionary;

const error = require('../Errors');

const StrexpArray = require('./StrexpArray');
const StrexpString = require('./StrexpString');
const StrexpSymbol = require('./StrexpSymbol');

const SystemLambda = require('./lambdas/SystemLambda');
