var express = require('express');
var router = express.Router();

/**
 *  /user/register endpoint
 */
router.post('/register', function(req, res, next) {
  
  // return error if request body incomplete
  if (!req.body.email || !req.body.password){
    res.status(400);
    res.json({error: true, message: "Request body incomplete - email and password needed"});
  } 
  else {
    let query = req.db("users"); // get db query instance

    // try selecting row with given username
    query.select().where("email", "=", req.body.email)
      .then((rows) => {
        // if there's a row, return error message
        if (rows.length){
          res.status(409);
          res.json({error: true, message: "User already exists!"});
          return;
        }
        else {
          // insert new user
          query.insert({email: req.body.email, hash:req.body.password})
            .then(_ => {
              res.status(201);
              res.json({success: true, message: "User created"});
            })
            .catch(error => { // sql error
              res.status(500);
              res.json({message: 'Database error - not inserted'});
              console.log('Error on request body', JSON.stringify(req.body));
            })
        }
      })
    }
});

router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Login' });
});


module.exports = router;