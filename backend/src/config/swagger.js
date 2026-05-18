const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const swaggerDoc = YAML.load(path.join(__dirname, '../../swagger.yaml'));

module.exports = { swaggerUi, swaggerDoc };
