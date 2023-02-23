
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
        targets: [
            {
                datasource: {
                    type: 'prometheus',
                    uid: '_Du_XZKVk'
                },
                exemplar: true,
                expr: "max by (sbregion) (100 - irate(node_cpu_seconds_total{app='api', mode=\'idle\'}[5m]) * 100)",
                interval: '',
                legendFormat: '{{sbregion}}',
                refId: 'A'
            }
        ]
    });

    convert_style(widget, pannel);
    convert_yaxis(widget, pannel);
    convert_legend(widget, pannel);
    convert_thresholds(widget, pannel);
    return pannel;
}

function convert_style(widget, pannel) {
    const src_requests = widget.definition.requests;
    if (src_requests.length != 1)
        console.error(`invalid requests.length(${src_requests.length})`);

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
    console.error(`invalid src_display_type(${src_display_type})`);
}

function convert_yaxis(widget, pannel) {
    const src_yaxis = widget.definition.yaxis;
    if (src_yaxis) {
        const dst_defaults = pannel.fieldConfig.defaults;

        if (src_yaxis.min)
            dst_defaults.min = parseInt(src_yaxis.min);

        if (src_yaxis.max) {
            dst_defaults.max = parseInt(src_yaxis.max);
            if (dst_defaults.max == 100)
                dst_defaults.unit = 'percent';
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
                console.error(`invalid legend col(${col})`);
        });
    }
}

function get_threshold_value(marker_value) {
    const values = marker_value.split(/[ ,]+/);
    // marker_value: 10 < y < 20
    try {
        return parseInt(values[0]);
    } catch { }

    // marker_value: y = 10
    try {
        return parseInt(values.at(-1));
    } catch { }

    console.error(`invalid marker_value(${marker_value})`);
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

    console.error(`invalid marker_type(${marker_type})`);
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

module.exports = convert_timeseries;
