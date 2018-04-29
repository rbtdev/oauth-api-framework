const express = require('express');
const router = express.Router();

router.use('/', (req, res, next) => {
    req.logout();
    res.jsonApi(null, null);
});

module.exports = {
    isPrivate: true,
    router: router
}