const { pluginVersion } = require('../constant');

function convert_text(layout, widget) {
    const { definition, pannel } = layout.base(widget, 'note', 'text', 2);

    return Object.assign(pannel, {
        "options": {
            content: `# ${definition.content}`,
            mode: 'markdown',
        },
        pluginVersion,
    });
}

module.exports = convert_text;
