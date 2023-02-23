const { pluginVersion } = require('../constant');

function convert_text(layout, widget) {
    const { definition, pannel } = layout.base(widget, 'note', 'text', true);
    return Object.assign(pannel, {
        "options": {
            "content": "# Title\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)",
            "mode": "markdown"
        },
        pluginVersion,
    });
}

module.exports = convert_text;
