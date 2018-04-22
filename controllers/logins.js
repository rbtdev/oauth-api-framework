const User = require('../models').User;

function localUser(email, password, cb) {
  User.findOne({
    where: {
      email: email
    }
  })
    .then(user => {
      if (user) {
        user.validatePassword(password)
          .then(match => {
            if (match) {
              user = user.get({ plain: true });
              delete user.password;
              return cb(null, user);
            } else {
              return cb(null, false, 'invalid password');
            }
          })
      } else {
        cb(null, false, 'user not found');
      }
    })
    .catch(err => {
      cb(err);
    })
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
function facebookProfile(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({
    where: {
      $or: {
        fb_id: profile._json.id,
        email: profile._json.email
      }
    },
    defaults: {
      fb_id: profile._json.id,
      first_name: profile._json.name.split(' ')[0],
      last_name: profile._json.name.split(' ')[1] || '',
      email: profile._json.email,
      image: profile._json.picture.data.url
    }
  })
    .spread((user, created) => {
      user = user.get({ plain: true })
      user.isNew = created;
      cb(null, user);
    })
    .catch(err => {
      console.error(err);
      cb(err);
    })

}

function googleProfile(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({
    where: {
      $or: {
        google_id: profile._json.id,
        email: profile._json.email
      }
    },
    defaults: {
      first_name: profile._json.given_name,
      last_name: profile._json.family_name,
      image: profile._json.picture,
      email: profile._json.email,
      google_id: profile._json.id
    }
  })
    .spread((user, created) => {
      user = user.get({ plain: true })
      user.isNew = created;
      cb(null, user);
    })
    .catch(err => {
      console.error(err);
      cb(err);
    })
}

module.exports = {
  facebookProfile: facebookProfile,
  googleProfile: googleProfile,
  localUser: localUser
}
