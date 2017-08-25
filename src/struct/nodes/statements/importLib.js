const path = require('path');

module.exports = (node, scope) => {
    const [libName, ident, type] = node.tree;

    if (typeof ident === 'string' && scope.variables.has(ident)) {
        throw error(node, 'REDECLARATION', ident);
    } else
    if (Array.isArray(ident)) {
        for (const [, importID] of ident) {
            if (scope.variables.has(importID)) {
                throw error(node, 'REDECLARATION', importID);
            }
        }
    }

    const libPath = type === 'std'
        ? scope.program.constructor.getSTDLibPath()
        : scope.program.getModulesPath();

    const imports = scope.program.importModule(node, path.join(libPath, libName));

    if (Array.isArray(ident)) {
        for (const [id, importID] of ident) {
            if (!imports.has(id)) {
                throw error(node, 'EXPORT_NOT_EXIST', id);
            }

            scope.variables.set(importID, imports.get(id));
            scope.constants.add(importID);
        }

        return null;
    }

    if (ident === undefined) {
        for (const [key, value] of imports) {
            scope.variables.set(key, value);
            scope.constants.add(key);
        }

        return null;
    }

    const value = new StrexpDictionary(imports);
    value.frozen = true;

    scope.variables.set(ident, value);
    scope.constants.add(ident);
    return value;
};

const error = require('../../Errors');

const StrexpDictionary = require('../../types/StrexpDictionary');
