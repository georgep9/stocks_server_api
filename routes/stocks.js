var express = require('express');
var router = express.Router();

router.get('/symbols', function(req, res, next) {

    let query = req.db('stocks');

    req.query.industry && query.where("industry", "like", `%${req.query.industry}%`);

    query.distinct("name", "symbol", "industry")
      .then((rows) => {
        if (rows.length){
          res.status(200);
          res.json(rows);
        } else {
          res.json({ error: true, Message: "Industry sector not found" })
        }
        
      })
      .catch((err) => {
        console.log(err)
        res.json({ Error: false, Message: "Error in MySQL query" })
      })
  
});


router.get('/:symbol', function(req, res, next) {
  res.render('index', { title: "Symbol" });
});

router.get('/authed', function(req, res, next) {
  res.render('index', { title: 'Authed' });
});


module.exports = router;
