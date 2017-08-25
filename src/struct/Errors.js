const path = require('path');

const file = msg => ['File', msg];
const imports = msg => ['Import', msg];
const range = msg => ['Range', msg];
const reference = msg => ['Reference', msg];
const syntax = msg => ['Syntax', msg];
const type = msg => ['Type', msg];

const format = val => typeof val === 'symbol'
    ? val.toString().replace(/Symbol\((.+)\)/, '$$$1')
    : typeof val === 'string'
        ? `'${val}'`
        : String(val);

const errors = {
    // FileError
    COULD_NOT_PERFORM: (filepath, action, code) => file(`Could not ${action} '${path.resolve(filepath)}', error: ${code}`),

    // ImportError
    COULD_NOT_IMPORT: (filepath, code) => imports(`Could not get module '${path.resolve(filepath)}', error: ${code}`),
    COULD_NOT_VOID: filepath => imports(`Could not invalidate '${path.resolve(filepath)}', module has not been imported`),
    EXPORT_NOT_EXIST: key => imports(`Export name ${format(key)} does not exist`),

    // RangeError
    MAXIMUM_CALL_STACK_SIZE: range('Maximum call stack size exceeded'),
    PIPE_TOO_MANY: range('Cannot pipe into function requiring more than one parameter'),
    PIPE_NO_PARAMS: range('Cannot pipe into function with no parameters'),
    INFIX_TOO_MANY: range('Infix function requires more than two parameters'),
    INFIX_FEW_PARAMS: range('Infix function requires less than two parameters'),
    ARRAY_NO_POP: range('Array has no elements to pop'),
    ARRAY_NO_SHIFT: range('Array has no elements to shift'),
    ARRAY_NO_REDUCE: range('Not enough values to reduce'),

    NOT_ENOUGH_ARGS: (min, passed) => range(`Not enough arguments, expected minimum ${min}, passed ${passed}`),
    TOO_MANY_ARGS: (max, passed) => range(`Too many arguments, expected maximum ${max}, passed ${passed}`),
    TOO_MANY_BOUND: (max, passed) => range(`Too many bounded arguments, expected maximum ${max}, passed ${passed}`),
    OUT_OF_RANGE: (index, item = 'Index') => range(`${item} '${index}' is out of range`),

    // ReferenceError
    NOT_WITHIN_FUNCTION: reference('Not within a function to refer to'),

    NOT_DEFINED: ident => reference(`Variable '${ident}' is not defined`),
    KEY_NOT_EXIST: key => reference(`Key ${format(key)} does not exist`),

    // SyntaxError
    COULD_NOT_PARSE: syntax('Could not parse source code'),
    REST_PARAM_NOT_LAST: syntax('Rest parameter must be unique last parameter'),
    NON_OPTIONAL_AFTER: syntax('Non-optional parameter follows optional parameter'),
    SWITCH_NO_CASE: syntax('Switch cannot have cases without switch parameter'),
    DEFAULT_NOT_LAST: syntax('Default case must be last case'),
    ILLEGAL_RETURN: syntax('Illegal return statement'),
    ILLEGAL_BREAK: syntax('Illegal break statement'),
    ILLEGAL_CONTINUE: syntax('Illegal continue statement'),

    INVALID_TOKEN: char => syntax(`Invalid or unexpected token: ${char}`),
    INVALID_REGEXP_PATTERN: pattern => syntax(`Invalid regular expression pattern: ${pattern}`),
    INVALID_REGEXP_FLAGS: flags => syntax(`Invalid regular expressions flags: ${flags}`),

    // TypeError
    KEY_VALUE: type('Array is not a valid key-value entry'),
    FROZEN_DICTIONARY: type('Dictionary is frozen, cannot be modified'),
    SEALED_DICTIONARY: type('Dictionary is sealed, esiting keys cannot be modified'),

    REDECLARATION: ident => type(`Variable '${ident}' cannot be redeclared in this scope`),
    NOT_REASSIGNABLE: ident => type(`Variable '${ident}' cannot be reassigned`),
    PROPERTY_OF_NULL: prop => type(`Cannot read property '${prop}' of null`),
    PROPERTY_NOT_EXIST: (object, prop) => type(`Property '${prop}' does not exist on type ${Util.getType(object)}`),
    KEY_OF_NULL: key => type(`Cannot read key or index ${format(key)} of null`),
    VALUE_NOT_USABLE: (value, msg, verb = 'is') => type(`Value ${format(value)} ${verb} not ${msg}`),
    TYPE_NOT_USABLE: (value, msg, verb = 'is') => type(`Type ${Util.getType(value)} ${verb} not ${msg}`),
    TYPES_NOT_USABLE: (value1, value2, msg, verb = 'are') => type(`Types ${Util.getType(value1)} and ${Util.getType(value2)} ${verb} not ${msg}`)
};

function error(node, key, ...args) {
    if (!errors[key]) {
        throw new Error(`Invalid error key '${key}'`);
    }

    if (typeof errors[key] === 'function') {
        const [t, msg] = errors[key](...args);
        return new StrexpError(node, t, msg);
    }

    const [t, msg] = errors[key];
    return new StrexpError(node, t, msg);
}

module.exports = error;

const Util = require('./Util');

const StrexpError = require('./types/StrexpError');
