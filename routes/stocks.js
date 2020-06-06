var express = require('express');
var router = express.Router();

/**
 * /stocks/symbols API endpoint
 */ 
router.get('/symbols', function(req, res, next) {

    let query = req.db('stocks'); // get db query instance

    // check if industry queried
    if (req.query.industry){
      // if valid format, filter db query for industry provided
      if (/^[a-zA-Z]+$/.test(req.query.industry)){
        query.where("industry", "like", `%${req.query.industry}%`);
      }
      else { // else, respond with error
        res.status(400);
        res.json({error: true, message: "Invalid query parameter: only 'industry' is permitted"});
        return;
      }
    }

    // distinct select name, symbol, industry columns from db
    query.distinct("name", "symbol", "industry")
      .then((rows) => {
        // if there are rows, repond with json of rows
        if (rows.length){
          res.status(200);
          res.json(rows);
        } 
        else { // no rows returned, respond with error
          res.status(404);
          res.json({ error: true, message: "Industry sector not found" })
        }
      })
      .catch((err) => { // sql error
        console.log(err)
        res.json({ error: true, message: "Error in MySQL query" })
      })
  
});

/**
 * /stocks/{symbol} API endpoint
 */
router.get('/:symbol', function(req, res, next) {

  let query = req.db('stocks'); // get db query instance

  // check if symbol is correct format
  if (/^[A-Z]{1,5}$/.test(req.params.symbol)){

      // filter query for symbol provided
      query.where("symbol", "=", req.params.symbol);

      query.distinct("*")
        .then((rows) => {
          // if there are rows, respond with stock object json
          if (rows.length){
            res.status(200);
            res.json(rows[0]); // send only latest time entry
          }
          else { // no rows return, respond with error
            res.status(404);
            res.json({ error: true, message: "No entry for symbol in stocks database"})
          }
        })

  }
  else { // incorrect format, respond with error
    res.status(400);
    res.json({error: true, mesage: "Stock symbol incorrect format - must be 1-5 capital letters"});
  }

});


/**
 * /stocks/authed/{symbol} API endpoint
 */
router.get('/authed', function(req, res, next) {

  let query = req.db('stocks'); // get db query instance

  res.render('index', { title: 'Authed' });
});


module.exports = router;
