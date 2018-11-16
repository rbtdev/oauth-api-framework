var express = require('express');
var router = express.Router();
const User = require('../../models').User;


router.post('/', async function (req, res, next) {
  let userData = req.body;
  let [err, user] = await User.createWithHash(userData);
  if (err) {
      if (err = 'Email already exisit') res.status(409).jsonApi(err);
      else res.status(500).json(err);
    }
    else res.jsonApi(null, user)
});

module.exports = {
  isPrivate: false,
  router: router
}
