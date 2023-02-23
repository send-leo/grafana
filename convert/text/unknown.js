const { pluginVersion } = require('../constant');
const yaml = require('js-yaml');

function convert_unknown(layout, widget) {
    const clone = { ...widget.definition };
    const type = clone.type;
    delete clone.title;
    delete clone.type;
    const content = [
        '```',
        `# invalid type(${type})`,
        yaml.dump(clone),
        '```',
    ].join('\n');

    const { pannel } = layout.base(widget, type, 'text');
    return Object.assign(pannel, {
        options: {
            content,
            mode: 'markdown'
        },
        pluginVersion,
    });
}

module.exports = convert_unknown;
