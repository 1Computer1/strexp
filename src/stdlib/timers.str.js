const timers = new Map();

module.exports = (importNode, program, linkedProgram, { Util, error, StrexpString, BaseLambda, SystemLambda }) => ({
    timeout: new SystemLambda(2, 2, (node, time, callback) => {
        if (!(time instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', time, 'usable as duration');
        }

        if (!Util.isInteger(time.value)) {
            throw error(node, 'VALUE_NOT_USABLE', time.value, 'usable as duration');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        const timer = setTimeout(() => {
            callback.call(node, []);
            timers.delete(id);
        }, Number(time.value));

        const asyncSymbol = Object.getOwnPropertySymbols(timer)[0];
        const id = timer[asyncSymbol];
        timers.set(id, timer);

        return new StrexpString(id);
    }),

    interval: new SystemLambda(2, 2, (node, time, callback) => {
        if (!(time instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', time, 'usable as duration');
        }

        if (!Util.isInteger(time.value)) {
            throw error(node, 'VALUE_NOT_USABLE', time.value, 'usable as duration');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        const timer = setInterval(() => {
            callback.call(node, []);
        }, Number(time.value));

        const asyncSymbol = Object.getOwnPropertySymbols(timer)[0];
        const id = timer[asyncSymbol];
        timers.set(id, timer);

        return new StrexpString(id);
    }),

    clear: new SystemLambda(1, 1, (node, id) => {
        if (!(id instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', id, 'usable as time ID');
        }

        if (!Util.isInteger(id.value)) {
            throw error(node, 'VALUE_NOT_USABLE', id.value, 'a valid timer ID');
        }

        if (timers.has(Number(id.value))) {
            const timer = timers.get(Number(id.value));
            clearInterval(timer);
            clearTimeout(timer);
        }
    })
});
