var express = require('express');
var router = express.Router();
const User = require('../../models').User;


router.post('/', async function (req, res, next) {
  let userData = req.body;
  let user = await User.createWithHash(userData).catch(error);
  if (user) res.jsonApi(null, user);

  function error(err) {
    if (err = 'Email already exisit') res.status(409).jsonApi(err);
    else res.status(500).json(err);
  }
});

module.exports = {
  isPrivate: false,
  router: router
}
