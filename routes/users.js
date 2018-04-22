var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models').User;
const Message = require('../models').Message;

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.findAll()
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

// Get the user data for the user assoicated with this request
router.get('/me', function (req, res, next) {
  User.findById(req.user.id)
    .then(user => {
      user = user.get({ plain: true })
      res.json(user);
    })
    .catch(err => {
      res.status(500).json(err);
    })
})
router.get('/:userId/inbox', function (req, res, next) {
  const userId = req.params.userId;
  Message.findAll({
    where: {
      recipient: userId
    }
  })
    .then(inbox => {
      res.json(inbox);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

// Updates user //
router.put('/:userId', function (req, res) {
  // req.params.userId has the user id since the route for this is '/:userId' <-- that userId tells express to
  // create a req.params.userId with the value that is there in the url that is sent 
  // from the client 
  let id = req.params.userId;
  User.findById(id)
    .then(function (user) {
      if (user) {
        user.update({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          address: req.body.address,
          phone_number: req.body.phone_number,
          image: req.body.image,
          email: req.body.email,
          // password: req.body.password,   user cant update a password like this. For changing password 
          // we have to use a special route that uses bcrypt to re-hash it
          //complete: req.body.complete  <-- what is this, its not in the model?
        })
          .then(function (user) {
            res.json(user);
          })
          .catch(err => {
            res.status(500).json(err);
          })
      }
    });
});

module.exports = router;
