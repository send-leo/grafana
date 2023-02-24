const fs = require('fs');
const { parseIntStrict } = require('./convert/util');

const filtered = {}

function filter_group(res) {
    delete res.layout_type;
    delete res.show_title;
    delete res.type;
    delete res.widgets;
}

function filter_note(res) {
    delete res.content;
    delete res.type;
}

function filter_requests(res) {
    let ir = res.requests.length
    while (ir--) {
        const request = res.requests[ir];

        // display_type
        if (['area', 'bars', 'line', 'solid'].includes(request.display_type))
            delete request.display_type;

        // formulas
        if (request.formulas) {
            let i = request.formulas.length
            while (i--) {
                const f = request.formulas[i];
                if (f.alias == '')
                    delete f.alias;
                if (f.formula.startsWith('query')) {
                    const n = parseIntStrict(f.formula.substring(5));
                    if (1 <= n && n <= 26)
                        delete f.formula;
                }
                if (Object.keys(f).length == 0)
                    request.formulas.splice(i, 1);
            }
            if (!request.formulas.length)
                delete request.formulas;
        }

        // queries
        i = request.queries.length
        while (i--) {
            const q = request.queries[i];
            delete q.name;
            delete q.query;
            if (q.data_source == 'metrics')
                delete q.data_source;
            if (Object.keys(q).length == 0)
                request.queries.splice(i, 1);
        }
        if (!request.queries.length)
            delete request.queries;

        // style
        const style = request.style
        if (style) {
            if (style.palette == 'dog_classic')
                delete style.palette;
            if (style.line_type == 'solid')
                delete style.line_type;
            if (style.line_type == 'solid')
                delete style.line_type;
            if (style.line_width == 'normal')
                delete style.line_width;
            if (Object.keys(style).length == 0)
                delete request.style;
        }

        // response_format
        if (request.response_format == 'timeseries')
            delete request.response_format;

        // response_format
        if (request.on_right_yaxis === false)
            delete request.on_right_yaxis;

        if (Object.keys(request).length == 0)
            res.requests.splice(i, 1);
    }

    if (!res.requests.length)
        delete res.requests;
}

function filter_table(res) {
    delete res.content;
    delete res.type;

    filter_requests(res);
}

function filter_timeseries(res) {
    delete res.legend_columns;
    delete res.legend_layout;
    delete res.legend_size;
    delete res.markers;
    delete res.show_legend;
    delete res.type;

    filter_requests(res);

    const yaxis = res.yaxis;
    if (yaxis) {
        if (yaxis.include_zero == false)
            delete yaxis.include_zero;

        if (yaxis.label == '')
            delete yaxis.label;

        delete yaxis.max;
        delete yaxis.min;

        if (yaxis.scale == 'linear')
            delete yaxis.scale;

        if (Object.keys(yaxis).length == 0)
            delete res.yaxis;
    }
}

function filter_widget(res) {
    const type = res.type;
    if (type in filtered)
        filtered[type].push(res);
    else
        filtered[type] = [res];

    if (res.type == 'note')
        filter_note(res);
    else if (res.type == 'query_table')
        filter_table(res);
    else if (res.type == 'timeseries')
        filter_timeseries(res);
}

function clone_widget(widget) {
    const res = JSON.parse(JSON.stringify(widget.definition));
    delete res.title_align;
    delete res.title_size;
    return res;
}


function filter_datadog(datadog_path, output_dir) {
    const source = JSON.parse(fs.readFileSync(datadog_path));

    for (const group of source.widgets) {
        console.log();
        console.log(`[${group.definition.title}]`);
        filter_group(clone_widget(group));

        for (const widget of group.definition.widgets) {
            console.log('-', widget.definition.title || '(no name)');
            filter_widget(clone_widget(widget));
        }
    }

    for (const [key, widgets] of Object.entries(filtered)) {
        const errors = widgets.filter(widget => {
            const wkeys = Object.keys(widget);
            return wkeys.length != 1 || wkeys[0] != 'title'
        });

        fs.writeFileSync(
            `${output_dir}/${key}`,
            JSON.stringify(errors, null, 4)
        );
    }
}

filter_datadog('logs/datadog.json', 'logs/filtered');
