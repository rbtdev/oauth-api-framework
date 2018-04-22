var express = require('express');
var router = express.Router();
const User = require('../models').User;

var passport = null;

//
// Handle passport verification for all strategies
// This funtion is bound to the req, res, next 
// Passport sends the err, user, info 
// Handle the response to the client based on the result
// from passport verify, logging the user in if verify
// was successful.
//
function login(req, res, next, err, user, info) {
    if (err) return res.status(500).json(err);
    if (user) {
        console.log('Login Successful');
        req.login(user, (err => {
            return res.json(req.user)
        }));
    }
    else {
        console.log('Login unsuccessful', info);
        return res.status(401).json(info);
    }
}

//
// Inject the passport instance into the login router
// 
function init(_passport) {
    passport = _passport;

    //
    // Handle local password logins
    //
    router.post('/', (req, res, next) => {
        passport.authenticate('local', login.bind(null, req, res, next))(req, res, next);
    })

    //
    // Set up the /api/login/:provider/token routes (facebook and google)
    // This route is used by the client app to send us the OAuth access token as a query parameter
    // Send the request through the passport authenticate function for OAuth provider
    //
    router.get('/facebook/token', (req, res, next) => {
        passport.authenticate('facebook-token', login.bind(null, req, res, next))(req, res, next);
    });
    router.get('/google/token', passport.authenticate('google-token'), (req, res, next) => {
        passport.authenticate('google-token', login.bind(null, req, res, next))(req, res, next);
    })

    return router;
}

module.exports = init;
