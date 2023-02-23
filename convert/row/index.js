function convert_row(layout, widget) {
    const { pannel } = layout.base(widget, 'group', 'row', true);
    return Object.assign(pannel, {
        collapsed: false,
        panels: [],
    });
}

module.exports = convert_row;
