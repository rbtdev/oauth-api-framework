var express = require('express');
var router = express.Router();
const config = require('../../config');

/* GET all messages. */
router.get('/', function (req, res, next) {
    let appConfig = {
        oauth: {
            facebook: {
                clientID: config.fb.clientID
            },
            google: {
                clientID: config.google.clientID
            }
        }
    }
    res.jsonApi(null, appConfig);
});

module.exports = {
    isPrivate: false,
    router: router
}
