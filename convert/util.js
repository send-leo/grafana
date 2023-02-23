const fs = require('fs').promises;
const Layout = require('./layout');
const convert_row = require('./row');
const convert_timeseries = require('./timeseries');
const convert_table = require('./table');
const convert_text = require('./text');
const convert_unknown = require('./text/unknown');

function convert_panel(layout, widget) {
    switch (widget.definition.type) {
        case 'timeseries': return convert_timeseries(layout, widget);
        case 'query_table': return convert_table(layout, widget);
        case 'note': return convert_text(layout, widget);
    }
    return convert_unknown(layout, widget);
}

function make_panels(source) {
    const layout = new Layout();
    const panels = [];

    for (const group of source.widgets) {
        console.log();
        console.log(`[${group.definition.title}]`);
        const row = convert_row(layout, group)
        panels.push(row);

        for (const widget of group.definition.widgets) {
            console.log('-', widget.definition.title || '(no name)');
            const panel = convert_panel(layout, widget);
            panels.push(panel);
        }
    }

    return panels;
}

async function datadog_to_grafana(datadog_path, output_path) {
    const [source, output] = (await Promise.all([
        await fs.readFile(datadog_path),
        await fs.readFile(output_path),
    ])).map(JSON.parse);

    output.panels = make_panels(source);

    await fs.rename(output_path, `${output_path}.bak`);
    await fs.writeFile(output_path, JSON.stringify(output, null, 4));

    const group_cnt = source.widgets.length;
    const panel_cnt = output.panels.length - group_cnt;

    console.log();
    console.log('groups:', group_cnt);
    console.log('panels:', panel_cnt);
    console.log('output:', output_path);
}

module.exports = {
    datadog_to_grafana,
};
