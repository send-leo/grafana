const {
    parseIntStrict,
    get_target_datasource,
    get_target_expr,
    get_target_refId,
    check_target_names,
} = require('../util');

function convert_timeseries(layout, widget) {
    const pannel = layout.base(widget, 'timeseries', 'timeseries');
    Object.assign(pannel, {
        fieldConfig: {
            defaults: {
                color: {
                    mode: 'palette-classic'
                },
                custom: {
                    axisLabel: '',
                    axisPlacement: 'auto',
                    barAlignment: 0,
                    drawStyle: 'line',
                    fillOpacity: 0,
                    gradientMode: 'none',
                    hideFrom: {
                        legend: false,
                        tooltip: false,
                        viz: false
                    },
                    lineInterpolation: 'linear',
                    lineWidth: 1,
                    pointSize: 5,
                    scaleDistribution: {
                        type: 'linear'
                    },
                    showPoints: 'auto',
                    spanNulls: false,
                    stacking: {
                        group: 'A',
                        mode: 'none'
                    },
                    thresholdsStyle: {
                        mode: 'off'
                    }
                },
                mappings: [],
                thresholds: {
                    mode: 'absolute',
                    steps: [
                        {
                            color: 'transparent',
                            value: null
                        }
                    ]
                }
            },
            overrides: []
        },
        options: {
            legend: {
                calcs: [],
                displayMode: 'hidden',
                placement: 'bottom'
            },
            tooltip: {
                mode: 'single',
                sort: 'none'
            }
        },
        targets: []
    });

    convert_style(widget, pannel);
    convert_yaxis(widget, pannel);
    convert_legend(widget, pannel);
    convert_thresholds(widget, pannel);
    convert_targets(widget, pannel);
    return pannel;
}

function convert_style(widget, pannel) {
    const src_requests = widget.definition.requests;
    if (src_requests.length != 1)
        console.error(`invalid: requests.length(${src_requests.length})`);

    const src_display_type = src_requests[0].display_type;
    const dst_custom = pannel.fieldConfig.defaults.custom;
    switch (src_display_type) {
        case 'line': return;
        case 'area':
            dst_custom.fillOpacity = 100;
            dst_custom.lineStyle = { fill: 'solid' };
            dst_custom.stacking.mode = 'normal';
            return;
        case 'bars':
            dst_custom.drawStyle = 'bars';
            dst_custom.fillOpacity = 100;
            dst_custom.lineStyle = { fill: 'solid' };
            dst_custom.stacking.mode = 'normal';
            return;
    }
    console.error(`invalid: src_display_type(${src_display_type})`);
}

function convert_yaxis(widget, pannel) {
    const src_yaxis = widget.definition.yaxis;
    if (src_yaxis) {
        const dst_defaults = pannel.fieldConfig.defaults;

        if (src_yaxis.min) {
            const n = parseIntStrict(src_yaxis.min);
            if (!isNaN(n))
                dst_defaults.min = n;
        }

        if (src_yaxis.max) {
            const n = parseIntStrict(src_yaxis.max);
            if (!isNaN(n)) {
                dst_defaults.max = n;
                if (n == 100)
                    dst_defaults.unit = 'percent';
            }
        }
    }
}

function convert_legend(widget, pannel) {
    const src_def = widget.definition;
    if (src_def.show_legend) {
        const dst_legend = pannel.options.legend;
        dst_legend.displayMode = 'table';

        src_def.legend_columns.forEach(col => {
            if (['min', 'max', 'sum'].includes(col))
                dst_legend.calcs.push(col);
            else if (col == 'avg')
                dst_legend.calcs.push('mean');
            else
                console.error(`invalid: legend col(${col})`);
        });
    }
}

function get_threshold_value(marker_value) {
    const values = marker_value.split(/[ ,]+/);
    // marker_value: 10 < y < 20
    let threshold = parseIntStrict(values[0]);
    if (!isNaN(threshold))
        return threshold;

    // marker_value: y = 10
    threshold = parseIntStrict(values.at(-1));
    if (!isNaN(threshold))
        return threshold;

    console.error(`invalid: marker_value(${marker_value})`);
    return null;
}

function get_threshold_color(marker_type) {
    const values = marker_type.split(/[ ,]+/);
    // marker_type: ok solid

    switch (values[0]) {
        case 'info': return 'blue';
        case 'ok': return 'green';
        case 'warning': return 'orange';
        case 'error': return 'red';
    }

    console.error(`invalid: marker_type(${marker_type})`);
    return null;
}

function convert_thresholds(widget, pannel) {
    const src_markers = widget.definition.markers;
    if (src_markers) {
        pannel.fieldConfig.defaults.custom.thresholdsStyle.mode = 'area';
        const dst_steps = pannel.fieldConfig.defaults.thresholds.steps;
        src_markers.forEach(marker => {
            const value = get_threshold_value(marker.value);
            const color = get_threshold_color(marker.display_type);
            if (color) {
                if (value == 0)
                    dst_steps[0].color = color;
                else if (0 < value)
                    dst_steps.push({ value, color });
            }
        })
    }
}

function convert_targets(widget, pannel) {
    const dst_targets = pannel.targets;
    const refIdSet = new Set();
    let formula_id = 0;

    for (request of widget.definition.requests) {
        const nameMap = {}

        // queries
        const src_queries = request.queries;
        src_queries.forEach(q => {
            const datasource = get_target_datasource(q.data_source);
            const expr = get_target_expr(q.query);
            const refId = get_target_refId(q.name);

            if (datasource && expr && refId) {
                nameMap[q.name] = refId;
                refIdSet.add(refId);
                dst_targets.push({
                    datasource,
                    exemplar: true,
                    expr,
                    interval: '',
                    legendFormat: '',
                    refId,
                });
            }
        });

        // formulas
        const src_formulas = request.formulas;
        if (src_formulas) {
            src_formulas.forEach(f => {
                let expression = get_target_expr(f.formula);
                for ([name, refId] of Object.entries(nameMap))
                    expression = expression.replace(name, `$${refId}`);

                if (expression) {
                    const refId = `formula_${formula_id++}`;
                    refIdSet.add(refId);
                    dst_targets.push({
                        datasource: { type: '__expr__', uid: '__expr__' },
                        expression,
                        hide: false,
                        refId,
                        type: 'math'
                    });
                }
            });
        }

        break;
    }

    check_target_names(dst_targets, refIdSet);
}

module.exports = convert_timeseries;
