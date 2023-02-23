const { pluginVersion } = require('../constant');

function convert_text(layout, widget) {
    const pannel = layout.base(widget, 'note', 'text', 2);
    return Object.assign(pannel, {
        "options": {
            content: `# ${widget.definition.content}`,
            mode: 'markdown',
        },
        pluginVersion,
    });
}

module.exports = convert_text;
