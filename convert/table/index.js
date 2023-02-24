const { pluginVersion } = require('../constant');
const {
    get_target_datasource,
    get_target_expr,
    get_target_refId,
    check_target_names,
} = require('../util');

function convert_table(layout, widget) {
    const pannel = layout.base(widget, 'query_table', 'table');
    Object.assign(pannel, {
        fieldConfig: {
            defaults: {
                color: {
                    mode: 'thresholds'
                },
                custom: {
                    align: 'auto',
                    displayMode: 'auto'
                },
                mappings: [],
                thresholds: {
                    mode: 'absolute',
                    steps: [
                        {
                            'color': 'green',
                            'value': null
                        },
                        {
                            'color': 'red',
                            'value': 80
                        }
                    ]
                }
            },
            overrides: []
        },
        options: {
            footer: {
                fields: '',
                reducer: [
                    'sum'
                ],
                show: false
            },
            showHeader: true
        },
        targets: [],
        pluginVersion,
    });

    convert_targets(widget, pannel);
    return pannel;
}

function convert_targets(widget, pannel) {
    const src_queries = widget.definition.requests[0].queries;
    const dst_targets = pannel.targets;
    const refIdSet = new Set();

    src_queries.forEach(query => {
        const datasource = get_target_datasource(query.data_source);
        const expr = get_target_expr(query.query);
        const refId = get_target_refId(query.name);

        if (datasource && expr && refId) {
            refIdSet.add(refId);
            dst_targets.push({
                datasource,
                exemplar: true,
                expr,
                format: 'table',
                interval: '',
                legendFormat: '',
                refId,
            });
        }
    });

    check_target_names(dst_targets, refIdSet);
}

module.exports = convert_table;
