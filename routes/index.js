const apiRoutes = require('./api');
const webRoutes = require('./web');

module.exports = {
    web: webRoutes,
    api: apiRoutes
}