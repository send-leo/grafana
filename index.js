const { datadog_to_grafana } = require('./convert/util');

datadog_to_grafana('logs/datadog.json', 'logs/output.json');
