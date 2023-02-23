const assert = require('node:assert/strict');
const {
    datasource, grid_max
} = require('./constant');

class Layout {
    constructor(cx = 8, cy = 8) {
        this.pannel_x = 0;
        this.pannel_y = 0;
        this.pannel_cx = cx;
        this.pannel_cy = cy;
    }

    base(widget, srcType, dstType, fillGrid = false) {
        const { id, definition } = widget;

        assert.strictEqual(definition.type, srcType);
        assert.ok(dstType);

        const is_row = (dstType == 'row');

        const cx = fillGrid ? grid_max : this.pannel_cx;
        const cy = is_row ? 1 : this.pannel_cy;
        if (grid_max < this.pannel_x + cx) {
            this.pannel_x = 0;
            this.pannel_y += cy;
        }

        const pannel = {
            id,
            type: dstType,
            title: definition.title || 'no title',
            gridPos: {
                x: this.pannel_x,
                y: this.pannel_y,
                w: cx,
                h: cy,
            },
        };

        this.pannel_x += cx;
        if (grid_max <= this.pannel_x) {
            this.pannel_x = 0;
            this.pannel_y += cy;
        }

        if (!is_row)
            Object.assign(pannel, { datasource });

        return { definition, pannel }
    }

}

module.exports = Layout;
