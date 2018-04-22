var express = require('express');
var router = express.Router();
const User = require('../models').User;

router.post('/', function (req, res, next) {
  let userData = req.body;
  User.createWithHash(userData)
    .then(user => res.json(user))
    .catch(err => {
      if (err = 'Email already exisit') res.status(409).json(err);
      else res.status(500).json(err);
    })
});

module.exports = router;
