var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 *  /user/register API endpoint
 */
router.post('/register', function(req, res, next) {
  
  // return error if request body incomplete
  if (!req.body.email || !req.body.password){
    res.status(400);
    res.json({error: true, message: "Request body incomplete - email and password needed"});
  } 
  else {
    let query = req.db("users"); // get db query instance

    // try selecting row with given email
    query.select().where("email", "=", req.body.email)
      .then((rows) => {

        // if a user exits, return error message
        if (rows.length){
          res.status(409);
          res.json({error: true, message: "User already exists!"});
          return;
        }
        else {

          // generate hashed password
          const saltRounds = 10;
          const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

          // insert new user
          query.insert({email: req.body.email, hash: hashedPassword})
            .then(_ => {
              res.status(201);
              res.json({success: true, message: "User created"});
            })
            .catch(error => { // sql error
              res.status(500);
              res.json({message: 'Database error - not inserted'});
              console.log('Error on request body for REGISTER', JSON.stringify(req.body));
              console.log(error);
            })
        }
      })
    }
});


/**
 * /user/login API endpoint
 */
router.post('/login', function(req, res, next) {
  
  // return error if request body incomplete
  if (!req.body.email || !req.body.password){
    res.status(400);
    res.json({error: true, message: "Request body incomplete - email and password needed"});
  } 
  else {
    let query = req.db("users"); // get db query instance

    // try selecting row with given email
    query.select()
      .where("email", "=", req.body.email)
      .then((users) => {

        // return false if user not found
        if (users.length === 0){ return false; }
        const user = users[0];

        // return true if passwords match
        return bcrypt.compare(req.body.password, user.hash);

      })
      .then((match) => {

        // return error if user not found, or passwords don't match
        if (!match){
          res.status(401);
          res.json({
            error: true,
            message: "Incorrect email or password"
          })
          return;
        }
        else { // return successful login

          const secretKey = "secretkey";
          const expires_in = 60 * 60 * 24; // a day
          const exp = Date.now() + expires_in * 1000;
          const email = req.body.email;
          const token = jwt.sign({ email, exp }, secretKey)

          res.status(200);
          res.json({ token_type: "Bearer", token, expires_in })
        }

      })
      .catch(error => { // sql error
        res.status(500);
        res.json({message: 'Database error - not selected'});
        console.log('Error on request body for LOGIN', JSON.stringify(req.body));
        console.log(error);
      })
  
  }

});


module.exports = router;