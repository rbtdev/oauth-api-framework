var express = require('express');
var router = express.Router();
const User = require('../../models').User;
const Message = require('../../models').Message;

/* GET users listing. */
router.get('/', async function (req, res, next) {
  let users = await User.findAll({
    limit: req.query.limit,
    offset: req.offset
  }).catch(err => { res.status(500).jsonApi(err) })
  if (users) res.jsonApi(null, users, { paginate: true });
});

// Get the user data for the user assoicated with this request
router.get('/me', async function (req, res, next) {
  let user = await User.findById(req.user.id).catch(err => { res.status(500).jsonApi(err) });
  user = user.get({ plain: true });
  if (user) res.jsonApi(null, user);
})

router.get('/:userId/messages', async function (req, res, next) {
  const userId = req.params.userId;
  let messages = await Message.findAll({
    limit: req.query.limit,
    offset: req.offset,
    where: {
      userId: userId
    }
  }).catch(err => { res.status(500).jsonApi(err) })
  if (messages) res.jsonApi(null, messages, { paginate: true });
});

// Updates user //
router.put('/:userId', async function (req, res) {
  let id = req.params.userId;
  let user = await User.findById(id).catch(err => { res.status(500).jsonApi(err) })
  if (user) {
    let updatedUser = await user.update({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      phone_number: req.body.phone_number,
      image: req.body.image,
      email: req.body.email
    }).catch(err => { res.status(500).jsonApi(err) });
    res.jsonApi(null, updatedUser);
  }
  else {
    res.status(404).jsonApi('user not found');
  }
});

module.exports = {
  isPrivate: true,
  router: router
}
