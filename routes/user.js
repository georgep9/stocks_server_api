var express = require('express');
var router = express.Router();

router.get('/register', function(req, res, next) {
  res.render('index', { title: 'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Login' });
});


module.exports = router;