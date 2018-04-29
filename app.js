var createError = require('http-errors');
var express = require('express');
var path = require('path');
var passport = require('passport');
var paginate = require('express-paginate');

// Use Facebook and Google token authentication with passport
var FacebookToken = require('passport-facebook-token');
var GoogleToken = require('passport-google-token').Strategy;
var LocalStrategy = require('passport-local');

var https = require('https');
var http = require('http');
var fs = require('fs');
var validator = require('express-validator')
var bodyParser = require('body-parser');

var routes = require('./routes');
var loginsController = require('./controllers/logins');
var usersController = require('./controllers/users');
var config = require('./config')

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.

// Tell passport to use the config setings and login controller for each of the
// Toekn authentication mechanisms
passport.use(new FacebookToken(config.fb, loginsController.facebookProfile));
passport.use(new GoogleToken(config.google, loginsController.googleProfile));
passport.use(new LocalStrategy({ usernameField: 'email' }, loginsController.localUser));
passport.serializeUser(usersController.serialize);
passport.deserializeUser(usersController.deserialize);

var app = express();

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Set up our API routes
app.use(express.static('public'))
app.use('/', routes.web);
app.use(paginate.middleware(10, 50));
app.use(jsonApi);
app.use('/api', routes.api);
require('./utils/routes').list('/api');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//
// Middleware to format a JSON API response
// If error is reported, send a body with an "errors" array,
// if no error is reported, send a body with a "data" object (could be an array)
// If options.paginate is true, send a "paginate" object which has
// a "next" and "prev" api URI
//
function jsonApi(req, res, next) {
  res.jsonApi = (err, data, _options) => {
    let options = _options || {};
    payload = {};
    if (err) {
      console.error(err);
      if (Array.isArray(err)) payload.errors = err;
      else payload.errors = [err];
    }
    else {
      if (options.paginate && res.locals.paginate) {
        let prevPage = res.locals.paginate.page-1;
        let nextPage = res.locals.paginate.page+1;
        let prev = {
          page: prevPage,
          limit: res.locals.paginate.limit
        }
        let next = {
          page: nextPage,
          limit: res.locals.paginate.limit
        };
        payload.paginate = {
          next: next,
          prev: prevPage?prev:null
        }
      }
      payload.data = data || {};
    }
    res.json(payload);
  }
  next();
}
module.exports = app;