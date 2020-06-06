var express = require('express');
var router = express.Router();

router.get('/symbols', function(req, res, next) {
	req.db.from('stocks').select('*')
		.then ((rows) => {
			res.json({"Error": false, "Message": "Success", "Stocks": rows})
		})
		.catch((err) => {
			console.log(err);
			res.json({"Error": true, "Message": "Error executing MySQL query"})
		})
});

router.get('/:symbol', function(req, res, next) {
  res.render('index', { title: "Symbol" });
});

router.get('/authed', function(req, res, next) {
  res.render('index', { title: 'Authed' });
});


module.exports = router;
