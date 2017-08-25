module.exports = (importNode, program, linkedProgram, { error, StrexpString, SystemLambda }) => ({
    now: new SystemLambda(0, 0, () => {
        return new StrexpString(Date.now());
    }),

    parse: new SystemLambda(1, 1, (node, string) => {
        if (!(string instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', string, 'usable as a date');
        }

        const time = Date.parse(string.value);

        if (isNaN(time)) {
            throw error(node, 'VALUE_NOT_USABLE', string.value, 'a valid date');
        }

        return new StrexpString(time);
    }),

    year_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const year = new Date(Number(timestamp.value)).getUTCFullYear();

        if (isNaN(year)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(year);
    }),

    month_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const month = new Date(Number(timestamp.value)).getUTCMonth() + 1;

        if (isNaN(month)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(month);
    }),

    date_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const date = new Date(Number(timestamp.value)).getUTCDate();

        if (isNaN(date)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(date);
    }),

    day_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const day = new Date(Number(timestamp.value)).getUTCDay();

        if (isNaN(day)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(day);
    }),

    hours_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const hours = new Date(Number(timestamp.value)).getUTCHours();

        if (isNaN(hours)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(hours);
    }),

    minutes_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const minutes = new Date(Number(timestamp.value)).getUTCMinutes();

        if (isNaN(minutes)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(minutes);
    }),

    seconds_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const seconds = new Date(Number(timestamp.value)).getUTCSeconds();

        if (isNaN(seconds)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(seconds);
    }),

    milliseconds_at: new SystemLambda(1, 1, (node, timestamp) => {
        if (!(timestamp instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', timestamp, 'usable as a timestamp');
        }

        const milliseconds = new Date(Number(timestamp.value)).getUTCMilliseconds();

        if (isNaN(milliseconds)) {
            throw error(node, 'VALUE_NOT_USABLE', timestamp.value, 'a valid date');
        }

        return new StrexpString(milliseconds);
    })
});
