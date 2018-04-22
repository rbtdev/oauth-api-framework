var express = require('express');
var router = express.Router();
const Message = require('../models').Message;

/* GET users listing. */
router.get('/', function(req, res, next) {
  Message.findAll()
    .then (messages => {
      res.json(messages);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

module.exports = router;
