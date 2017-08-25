const Type = require('./Type');

class StrexpString extends Type {
    constructor(value) {
        super(String(value));
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

    get property_concat() {
        return new SystemLambda(1, Infinity, (node, ...strings) => {
            return new StrexpString(strings.reduce((res, curr) => {
                if (!(curr instanceof StrexpString)) {
                    throw error(node, 'TYPE_NOT_USABLE', curr, 'concatenatable');
                }

                return res + curr.value;
            }, this.value));
        });
    }

    get property_length() {
        return new StrexpString(this.value.length);
    }

    get property_upper() {
        return new SystemLambda(0, 0, () => {
            return new StrexpString(this.value.toUpperCase());
        });
    }

    get property_lower() {
        return new SystemLambda(0, 0, () => {
            return new StrexpString(this.value.toLowerCase());
        });
    }

    get property_match() {
        return new SystemLambda(1, 1, (node, matchAgainst) => {
            if (matchAgainst instanceof StrexpRegExp) {
                if (matchAgainst.value.global) {
                    const matches = [];
                    let match;

                    while ((match = matchAgainst.value.exec(this.value)) != null) {
                        matches.push(match);
                    }

                    return new StrexpArray(matches.map(m => new StrexpMatch(m)));
                }

                const match = this.value.match(matchAgainst.value);
                if (!match) return null;
                return new StrexpMatch(match);
            }

            if (matchAgainst instanceof StrexpString) {
                if (this.value !== matchAgainst.value) return null;
                const arr = [this.value];
                arr.index = 0;
                arr.input = this.value;
                return new StrexpMatch(arr);
            }

            throw error(node, 'TYPE_NOT_USABLE', matchAgainst, 'usable for matching against');
        });
    }

    get property_replace() {
        return new SystemLambda(2, 2, (node, matchAgainst, replacer) => {
            if (!(matchAgainst instanceof StrexpRegExp)) {
                throw error(node, 'TYPE_NOT_USABLE', matchAgainst, 'usable as a regular expression');
            }

            if (replacer instanceof StrexpString) {
                return new StrexpString(this.value.replace(matchAgainst.value, replacer.value));
            }

            if (replacer instanceof StrexpDictionary) {
                return new StrexpString(this.value.replace(matchAgainst.value, match => {
                    if (!replacer.value.has(match)) {
                        throw error(node, 'KEY_NOT_EXIST', match);
                    }

                    const replaceValue = replacer.value.get(match);
                    if (!(replaceValue instanceof StrexpString)) {
                        throw error(node, 'TYPE_NOT_USABLE', replaceValue, 'usable to replace');
                    }

                    return replaceValue.value;
                }));
            }

            if (replacer instanceof BaseLambda) {
                return new StrexpString(this.value.replace(matchAgainst.value, (...args) => {
                    args = args.slice(0, replacer.maxArgs).map(a => new StrexpString(a));
                    const replaceValue = replacer.call(node, args);
                    if (!(replaceValue instanceof StrexpString)) {
                        throw error(node, 'TYPE_NOT_USABLE', replaceValue, 'usable to replace');
                    }

                    return replaceValue.value;
                }));
            }

            throw error(node, 'TYPE_NOT_USABLE', matchAgainst, 'usable to replace');
        });
    }

    get property_charcode_at() {
        return new SystemLambda(1, 1, (node, index) => {
            this.checkIndex(node, index);
            return new StrexpString(this.value.charCodeAt(Number(index.string)));
        });
    }

    get property_codepoint_at() {
        return new SystemLambda(1, 1, (node, index) => {
            this.checkIndex(node, index);
            return new StrexpString(this.value.codePointAt(Number(index.string)));
        });
    }

    get property_join() {
        return new SystemLambda(1, 1, (node, array) => {
            if (!(array instanceof StrexpArray)) {
                throw error(node, 'TYPE_NOT_USABLE', array, 'joinable');
            }

            return new StrexpString(array.value.map(item => {
                if (!(item instanceof StrexpString)) {
                    throw error(node, 'TYPE_NOT_USABLE', item, 'concatenatable');
                }

                return item.value;
            }).join(this.value));
        });
    }

    get property_split() {
        return new SystemLambda(0, 1, (node, splitter = new StrexpString('')) => {
            if (splitter instanceof StrexpString) {
                const strings = this.value.split(splitter.value).map(str => new StrexpString(str));
                return new StrexpArray(strings);
            }

            if (splitter instanceof StrexpRegExp) {
                const strings = this.value.split(splitter.value).map(str => new StrexpString(str));
                return new StrexpArray(strings);
            }

            throw error(node, 'TYPE_NOT_USABLE', splitter, 'usable to split');
        });
    }

    get property_slice() {
        return new SystemLambda(1, 2, (node, start, end = new StrexpString(this.value.length)) => {
            this.checkIndex(node, start);
            this.checkIndex(node, end, true);
            const str = this.value.slice(Number(start.value), Number(end.value));
            return new StrexpString(str);
        });
    }

    get property_regexp() {
        return new SystemLambda(0, 1, (node, flags = undefined) => {
            if (flags !== undefined && !(flags instanceof StrexpString)) {
                throw error(node, 'TYPE_NOT_USABLE', flags, 'usable as regular expression flags');
            }

            const regexp = StrexpRegExp.buildRegExp(node, this.value, flags ? flags.value : '');
            return new StrexpRegExp(regexp);
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

module.exports = StrexpString;

const Util = require('../Util');
const error = require('../Errors');

const StrexpArray = require('./StrexpArray');
const StrexpDictionary = require('./StrexpDictionary');
const StrexpMatch = require('./StrexpMatch');
const StrexpRegExp = require('./StrexpRegExp');

const BaseLambda = require('./lambdas/BaseLambda');
const SystemLambda = require('./lambdas/SystemLambda');
