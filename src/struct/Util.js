class Util {
    static getType(value) {
        if (value === null) return 'null';
        if (value instanceof BaseLambda) return 'function';
        if (value instanceof StrexpArray) return 'array';
        if (value instanceof StrexpDictionary) return 'dict';
        if (value instanceof StrexpError) return 'error';
        if (value instanceof StrexpMatch) return 'match';
        if (value instanceof StrexpRegExp) return 'regexp';
        if (value instanceof StrexpString) return 'string';
        if (value instanceof StrexpSymbol) return 'symbol';
        return undefined;
    }

    static format(item, parent = item, depth = 0) {
        if (item === null) return 'null';

        if (item instanceof BaseLambda) {
            const lengths = item.maxArgs === Infinity
                ? `${item.minArgs}+`
                : item.minArgs === item.maxArgs
                    ? item.minArgs
                    : `${item.minArgs}, ${item.maxArgs}`;

            return `[Function: ${lengths}]`;
        }

        if (item instanceof StrexpArray) {
            const items = item.value.map(it => {
                if (it === parent || it === item) return '[Circular]';
                return this.format(it, parent, depth + 1);
            });

            const space = '  '.repeat(depth + 1);
            return `[ ${items.join(`,\n${space}`)} ]`;
        }

        if (item instanceof StrexpDictionary) {
            const items = Array.from(item.value).map(([k, v]) => {
                const arrow = item.hidden.has(k)
                    ? '?>'
                    : '=>';

                if (typeof k === 'symbol') {
                    k = k.toString().replace(/Symbol\((.+)\)/, '$$$1');
                } else {
                    k = `'${k}'`;
                }

                if (v === parent || v === item) return `'${String(k)}' ${arrow} {Circular}`;
                return `${k} ${arrow} ${this.format(v, parent, depth + 1)}`;
            });

            const space = '  '.repeat(depth + 1);
            return `{ ${items.join(`,\n${space}`)} }`;
        }

        if (item instanceof StrexpError) {
            return `[${item.toString()}]`;
        }

        if (item instanceof StrexpMatch) {
            const groups = item.value.map(g => `'${g}'`);
            const space = '  '.repeat(depth + 1);
            return `[ ${groups.join(`,\n${space}`)},\n${space}'index' => '${item.value.index}',\n${space}'input' => '${item.value.input}' ]`;
        }

        if (item instanceof StrexpRegExp) {
            return item.value.toString();
        }

        if (item instanceof StrexpString) {
            if (depth > 0) return `'${item.value}'`;
            return item.value;
        }

        if (item instanceof StrexpSymbol) {
            return item.value.toString().replace(/Symbol\((.+)\)/, '$$$1');
        }

        return undefined;
    }

    static isInteger(string) {
        return /^(?:0|[1-9][0-9]*)$/.test(string);
    }

    static isIdentifier(string) {
        return !/^(?:continue|default|private|export|return|import|switch|unless|break|catch|const|throw|until|while|else|from|loop|null|then|void|when|with|for|let|try|as|do|if|in|of)$/.test(string)
        && /^[A-Za-z0-9_]+$/.test(string);
    }
}

module.exports = Util;

const StrexpArray = require('./types/StrexpArray');
const StrexpDictionary = require('./types/StrexpDictionary');
const StrexpError = require('./types/StrexpError');
const StrexpMatch = require('./types/StrexpMatch');
const StrexpRegExp = require('./types/StrexpRegExp');
const StrexpString = require('./types/StrexpString');
const StrexpSymbol = require('./types/StrexpSymbol');

const BaseLambda = require('./types/lambdas/BaseLambda');
