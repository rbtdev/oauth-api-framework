const express = require('express');
const router = express.Router();
const login = require('../../controllers/logins').login;

//
// Set up login routes using the appropriate login strategy
//
router.post('/', login('local'));
router.get('/facebook/token', login('facebook-token'))
router.get('/google/token', login('google-token'));

module.exports = {
    isPublic: true,
    router: router
};
