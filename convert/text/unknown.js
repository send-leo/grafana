const { pluginVersion } = require('../constant');

function convert_unknown(layout, widget) {
    const { definition } = widget;
    const { type } = definition;
    const body = JSON.stringify(definition, null, 4);
    const { pannel } = layout.base(widget, type, 'text');
    return Object.assign(pannel, {
        "options": {
            "content": `invalid type(${type})\n${body}`,
            "mode": "markdown"
        },
        pluginVersion,
    });
}

module.exports = convert_unknown;
