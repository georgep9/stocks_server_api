var express = require('express');
var router = express.Router();

/**
 * /stocks/symbols API endpoint
 */ 
router.get('/symbols', function(req, res, next) {

    let query = req.db('stocks'); // get db query instance

    const reqQuery = Object.keys(req.query); // array of query parameters

    // check for industry parameter and only industry parameter
    if (reqQuery.length === 1 && reqQuery.includes("industry")){
      query.where("industry", "like", `%${req.query.industry}%`) // filter for industry
    }
    else if (reqQuery.length){ // invalid parameter
      res.status(400);
      res.json({error: true, message: "Invalid query parameter: only 'industry' is permitted"});
      return;
    }

    // distinct select name, symbol, industry columns from stocks
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

  // respond with error if date parameters are provided
  if (req.query.from || req.query.to){
    res.status(400);
    res.json({error: true, message: "Date parameters only available on authenticated route /stocks/authed"});
    return;
  }

  // respond with error if incorrect symbol format
  if (/^[A-Z]{1,5}$/.test(req.params.symbol) == false){
    res.status(400);
    res.json({error: true, mesage: "Stock symbol incorrect format - must be 1-5 capital letters"});
    return;
  }

  // distinct select all columns from stocks
  query.distinct("*")
    .where("symbol", "=", req.params.symbol) // filter for symbol
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

});


/**
 * /stocks/authed/{symbol} API endpoint
 */
router.get('/authed/:symbol', function(req, res, next) {

  let query = req.db('stocks'); // get db query instance
  let fromDate = null;
  let toDate = null;

  if (req.query.from){
    fromDate = new Date(req.query.from);
    if (isNaN(fromDate)){
      res.status(400);
      res.json({errro: true, message: "From date cannot be parsed by Date.parse()"});
      return;
    }
  }

  if (req.query.to){
    toDate = new Date(req.query.to);
    if (isNaN(toDate)){
      res.status(400);
      res.json({errro: true, message: "To date cannot be parsed by Date.parse()"});
      return;
    }
  }

  query.select('*')
    .where("symbol", "=", `${req.params.symbol}`)
    .where("timestamp", ">=", `${req.query.from}`)
    .where("timestamp", "<", `${req.query.to}`)
    .then((rows) => {
      if (rows.length){
        res.status(200);
        req.query.from || req.query.to ? res.json(rows) : res.json(rows[0]);
      }
      else {
        res.status(404);
        res.json({error: true, 
          message: "No entries available for query symbol for supplied date range"});
      }
    })

});


module.exports = router;