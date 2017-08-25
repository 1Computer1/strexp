module.exports = (importNode, program, linkedProgram, { StrexpDictionary, StrexpString, SystemLambda, getSTDLibPath }) => ({
    js: new StrexpString('from JS'),

    Class: (() => {
        const classes = program.importModule(importNode, `${getSTDLibPath()}/classes`);
        return classes.get('class').call(importNode, [
            new StrexpDictionary(new Map([
                [
                    'init', new SystemLambda(2, 2, (node, thisArg, something) => {
                        thisArg.property_set.call(node, [new StrexpString('something'), something]);
                    })
                ]
            ]))
        ]);
    })()
});
