module.exports = (node, scope) => {
    const object = scope.getValue(node.tree[0]);
    const memberName = node.tree[1];

    if (object === null) {
        return null;
    }

    const property = object[`property_${memberName}`];

    if (property === undefined) {
        return null;
    }

    return property;
};
