var express = require('express');
var router = express.Router();
const Message = require('../../models').Message;

/* GET all messages. */
router.get('/', async function (req, res, next) {
  let messages = await Message.findAll({
    limit: req.query.limit,
    offset: req.offset
  }).catch(err => { res.status(500).jsonApi(err) });
  res.jsonApi(null, messages, { paginate: true });
});

module.exports = {
  isPrivate: true,
  router: router
}
