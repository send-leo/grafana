const { datadog_to_grafana } = require('./convert/tools');

datadog_to_grafana('logs/datadog.json', 'logs/output.json');
