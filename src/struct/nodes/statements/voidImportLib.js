const path = require('path');

module.exports = (node, scope) => {
    const [libName, type] = node.tree;

    const libPath = type === 'std'
        ? scope.program.constructor.getSTDLibPath()
        : scope.program.getModulesPath();

    scope.program.deleteImport(node, path.join(libPath, libName));
    return null;
};
