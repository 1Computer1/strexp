const randexp = require('randexp');
const readlineSync = require('readline-sync');

module.exports = (importNode, program, linkedProgram, {
    Util,
    error,
    StrexpArray,
    StrexpDictionary,
    StrexpError,
    StrexpRegExp,
    StrexpString,
    StrexpSymbol,
    BaseLambda,
    SystemLambda
}) => ({
    filepath: new SystemLambda(0, 0, () => {
        return program.filepath ? new StrexpString(program.filepath) : null;
    }),

    mainpath: new SystemLambda(0, 0, () => {
        const main = program.getMainModule();
        return main.filepath ? new StrexpString(main.filepath) : null;
    }),

    print: new SystemLambda(1, Infinity, (node, ...args) => {
        const formatted = args.map(arg => Util.format(arg));
        console.log(...formatted);
    }),

    printerr: new SystemLambda(1, Infinity, (node, ...args) => {
        const formatted = args.map(arg => Util.format(arg));
        console.error(...formatted);
    }),

    input: new SystemLambda(0, 0, () => {
        return new StrexpString(readlineSync.question());
    }),

    format: new SystemLambda(1, 1, (node, item) => {
        return new StrexpString(Util.format(item));
    }),

    type: new SystemLambda(1, 1, (node, value) => {
        return new StrexpString(Util.getType(value));
    }),

    array: new SystemLambda(1, 2, (node, size, fillWith = null) => {
        if (!(size instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', size, 'usable as size');
        }

        if (!Util.isInteger(size.value)) {
            throw error(node, 'VALUE_NOT_USABLE', size.value, 'usable as size');
        }

        const filler = fillWith instanceof BaseLambda
            ? (e, index) => {
                const args = [new StrexpString(index)].slice(0, fillWith.maxArgs);
                const ret = fillWith.call(node, args);
                return ret;
            }
            : () => fillWith;

        return new StrexpArray(Array.from({ length: Number(size.value) }, filler));
    }),

    dict: new SystemLambda(1, 1, (node, entries) => {
        if (!(entries instanceof StrexpArray)) {
            throw error(node, 'TYPE_NOT_USABLE', entries, 'usable as dictionary entries');
        }

        const dict = new StrexpDictionary(new Map());
        for (const entry of entries.value) {
            if (!(entry instanceof StrexpArray)) {
                throw error(node, 'TYPE_NOT_USABLE', entry, 'usable as dictionary entry');
            }

            if (entry.value.length !== 2) {
                throw error(node, 'KEY_VALUE');
            }

            const [key, value] = entry.value;
            if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
                throw error(node, 'TYPE_NOT_USABLE', key, 'usable as dictionary key');
            }

            dict.value.set(key.value, value);
        }

        return dict;
    }),

    regexp: new SystemLambda(1, 2, (node, source, flags = undefined) => {
        if (!(source instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', source, 'convertable to a regular expression');
        }

        if (flags !== undefined && !(flags instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', flags, 'usable as regular expression flags');
        }

        const regexp = StrexpRegExp.buildRegExp(node, source.value, flags ? flags.value : '');
        return new StrexpRegExp(regexp);
    }),

    char: new SystemLambda(1, 1, (node, codePoint) => {
        if (!(codePoint instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', codePoint, 'usable as a codepoint');
        }

        if (!Util.isInteger(codePoint.value)) {
            throw error(node, 'VALUE_NOT_USABLE', codePoint.value, 'usable as a codepoint');
        }

        try {
            return new StrexpString(String.fromCodePoint(Number(codePoint.value)));
        } catch (err) {
            throw error(node, 'OUT_OF_RANGE', codePoint.value, 'Code point');
        }
    }),

    random: new SystemLambda(1, 1, (node, regexp) => {
        if (!(regexp instanceof StrexpRegExp)) {
            throw error(node, 'TYPE_NOT_USABLE', regexp, 'usable as a regular expression');
        }

        return new StrexpString(randexp.randexp(regexp.value));
    }),

    error: new SystemLambda(2, 2, (node, type, message) => {
        if (!(type instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', type, 'usable as an error type');
        }

        if (!(message instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', message, 'usable as an error message');
        }

        return new StrexpError(node, type.value, message.value);
    }),

    exit: new SystemLambda(0, 1, (node, code = new StrexpString('0')) => {
        if (!(code instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', code, 'usable as an exit code');
        }

        if (!Util.isInteger(code.value)) {
            throw error(node, 'VALUE_NOT_USABLE', code.value, 'usable as an exit code');
        }

        process.exit(Number(code.value));
    })
});
