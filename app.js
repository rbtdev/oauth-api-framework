var createError = require('http-errors');
var express = require('express');
var path = require('path');
var passport = require('passport');

// Use Facebook and Google token authentication with passport
var FacebookToken = require('passport-facebook-token');
var GoogleToken = require('passport-google-token').Strategy;
var LocalStrategy = require('passport-local');

var https = require('https');
var http = require('http');
var fs = require('fs');
var validator = require('express-validator')
var bodyParser = require('body-parser');

var usersRouter = require('./routes/users');
var messagesRouter = require('./routes/messages');
var LoginsRouter = require('./routes/logins');
var signupRouter = require('./routes/signup');

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
passport.use(new LocalStrategy({ usernameField: 'email'}, loginsController.localUser));
passport.serializeUser(usersController.serialize);
passport.deserializeUser(usersController.deserialize);

var passport = require('passport');

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
var loginsRouter = LoginsRouter(passport);
app.use(validator());
app.use('/api/login', loginsRouter);
app.use('/api/logout', logout );
app.use('/api/signup', signupRouter);
app.use('/api/users', isLoggedIn, usersRouter);
app.use('/api/messages', isLoggedIn, messagesRouter);

function isLoggedIn (req, res, next) {
  if (req.user) return next()
  else return res.status(401).json('Not Authenticated');
}
function logout (req, res, next) {
  req.logout();
  res.json(null);
};

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

module.exports = app;
