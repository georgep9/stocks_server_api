var express = require('express');
var router = express.Router();

router.get('/symbols', function(req, res, next) {
  res.render('index', { title: 'Symbols' });
});

router.get('/:symbol', function(req, res, next) {
  res.render('index', { title: "Symbol" });
});

router.get('/authed', function(req, res, next) {
  res.render('index', { title: 'Authed' });
});


module.exports = router;