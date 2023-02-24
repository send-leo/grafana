const constant = require('./constant');

function parseIntStrict(str) {
    const n = Number(str)
    return Number.isInteger(n) ? n : NaN;
}

function get_target_datasource(data_source) {
    if (data_source == 'metrics')
        return constant.datasource;

    console.error(`invalid: data_source(${data_source})`);
    return null;
}

function get_target_expr(query) {
    if (query)
        return query.replace('$Region', "sbregion=~'$sbregion'");

    console.error(`invalid: query(${query})`);
    return null;
}

function get_target_refId(name) {
    if (name.startsWith('query')) {
        const n = parseIntStrict(name.substring(5));
        if (1 <= n && n <= 26)
            return String.fromCharCode(64 + n);
    }
    return name;
}

function check_target_names(targets, refIdSet) {
    if (targets.length != refIdSet.size) {
        const names = src_queries.map(q => q.name);
        const ids = Array.from(refIdSet);
        throw Error(`invalid: duplicated names(${names}), ids(${ids})`);
    }
}

module.exports = {
    parseIntStrict,
    get_target_datasource,
    get_target_expr,
    get_target_refId,
    check_target_names,
};
