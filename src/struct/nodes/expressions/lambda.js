module.exports = (node, scope) => new StrexpLambda(scope, node.tree[0], node.tree[1]);
const StrexpLambda = require('../../types/lambdas/StrexpLambda');
