const User = require('../models').User;
const passport = require('passport');

async function localUser(email, password, cb) {
  let user = await User.findOne({
    where: {
      email: email
    }
  }).catch(cb);
  if (user) {
    let match = await user.validatePassword(password).catch(cb);
    if (match) {
      user = user.get({ plain: true });
      delete user.password;
      return cb(null, user);
    } else {
      return cb(null, false, 'invalid password');
    }
  } else {
    cb(null, false, 'user not found');
  }
}
//
// The profile functions are called by passoport once a successful
// Authentication has been acheived.  Eaach profile function will get 
// an accessToken, refreshToken (optional), and a profile objcet.  The 
// specific content of the profile object will be dependent on the 
// provider (google or facebook).  
// 
// We need to find or create a user in our DB based on the user id from 
// the provider. If no user exists with that profile id, create a new
// user in our database.
// 
// Send th user back to passport in the cb function.  The user will
// hen be serialized ans a session will be created
//
async function facebookProfile(accessToken, refreshToken, profile, cb) {
  let [user, created] = await User.findOrCreate({
    where: {
      $or: {
        fbId: profile._json.id,
        email: profile._json.email
      }
    },
    defaults: {
      fbId: profile._json.id,
      firstName: profile._json.name.split(' ')[0],
      lastName: profile._json.name.split(' ')[1] || '',
      email: profile._json.email,
      image: profile._json.picture.data.url,
      bio: "I love using Tutti",
      birthday: profile._json.birthday,
    }
  }).catch(cb);
  if (user) {
    user = user.get({ plain: true })
    user.isNew = created;
    cb(null, user);
  }
}

async function googleProfile(accessToken, refreshToken, profile, cb) {
  let [user, created] = await User.findOrCreate({
    where: {
      $or: {
        googleId: profile._json.id,
        email: profile._json.email
      }
    },
    defaults: {
      firstName: profile._json.given_name,
      lastName: profile._json.family_name,
      image: profile._json.picture,
      email: profile._json.email,
      googleId: profile._json.id,
      bio: "",
      birthday: profile._json.birthday,
    }
  }).catch(cb);
  if (user) {
    user = user.get({ plain: true })
    user.isNew = created;
    cb(null, user);
  }
}

//
// Handle passport verification for all strategies
// If passport verification is successful, send the response to
// the client with the current user object
// If an error, send an error response
//
function login(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, sendResponse)(req, res, next);

    function sendResponse (err, user, info) {
        if (err) return res.status(500).json(err);
        if (user) {
            console.log('Login Successful');
            req.login(user, (err => {
                return res.jsonApi(null, req.user)
            }));
        }
        else {
            console.log('Login unsuccessful', info);
            return res.status(401).jsonApi(info);
        }
    }
  }
}

module.exports = {
  facebookProfile: facebookProfile,
  googleProfile: googleProfile,
  localUser: localUser,
  login: login
}
