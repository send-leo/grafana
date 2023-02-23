const fs = require('fs');

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

function filter_table(res) {
    delete res.content;
    delete res.type;
}

function filter_timeseries(res) {
    delete res.legend_columns;
    delete res.legend_layout;
    delete res.legend_size;
    delete res.markers;
    delete res.show_legend;
    delete res.type;

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

function filter_datadog(datadog_path, output_dir) {
    const source = JSON.parse(fs.readFileSync(datadog_path));

    for (const group of source.widgets) {
        console.log();
        console.log(`[${group.definition.title}]`);
        const row = filter_group(JSON.parse(JSON.stringify(group.definition)));

        for (const widget of group.definition.widgets) {
            console.log('-', widget.definition.title || '(no name)');
            const panel = filter_widget(JSON.parse(JSON.stringify(widget.definition)));
        }
    }

    for (const [key, value] of Object.entries(filtered)) {
        fs.writeFileSync(
            `${output_dir}/${key}`,
            JSON.stringify(value, null, 4)
        );
    }
}

filter_datadog('logs/datadog.json', 'logs/filtered');
