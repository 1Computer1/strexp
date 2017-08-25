module.exports = (node, scope) => {
    const object = scope.getValue(node.tree[0]);
    const memberName = node.tree[1];

    if (object === null) {
        throw error(node, 'PROPERTY_OF_NULL', memberName);
    }

    const property = object[`property_${memberName}`];

    if (property === undefined) {
        throw error(node, 'PROPERTY_NOT_EXIST', object, memberName);
    }

    return property;
};

const error = require('../../Errors');
