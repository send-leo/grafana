const { pluginVersion } = require('../constant');

function convert_table(layout, widget) {
    const { definition, pannel } = layout.base(widget, 'query_table', 'table');
    return Object.assign(pannel, {
        "fieldConfig": {
            "defaults": {
                "color": {
                    "mode": "thresholds"
                },
                "custom": {
                    "align": "auto",
                    "displayMode": "auto"
                },
                "mappings": [],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {
                            "color": "green",
                            "value": null
                        },
                        {
                            "color": "red",
                            "value": 80
                        }
                    ]
                }
            },
            "overrides": []
        },
        "options": {
            "footer": {
                "fields": "",
                "reducer": [
                    "sum"
                ],
                "show": false
            },
            "showHeader": true
        },
        "targets": [
            {
                "datasource": {
                    "type": "prometheus",
                    "uid": "_Du_XZKVk"
                },
                "exemplar": true,
                "expr": "access_api_duration{}",
                "format": "table",
                "interval": "",
                "legendFormat": "",
                "refId": "A"
            }
        ],
        pluginVersion,
    });
}

module.exports = convert_table;
