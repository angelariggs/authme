var express = require('express');
var router = express.Router();
var app = require('../app');
var redis = require('redis');
var cache = redis.createClient();
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');
var sendEmail = require('./verify');

cache.del("tweets");

/*CHECKS TO SEE IF A USER IS ALREADY LOGGED IN ON INITIAL PAGE VISIT*/
router.get('/', function(request, response) {
  if (!request.cookies.username) {
    response.render('index', { username: null });
    return;
  }

  var username = request.cookies.username;
  var userID = request.body.userID;
  var database = app.get('database');


  cache.lrange("tweets", 0, -1, function(error, cacheResult) {
    console.log("getting results for tweet cache")
    if (cacheResult.length < 1) {
      console.log("result not found, refresh from database");
        // request to only display the tweet column from the tweets table, of the user (username) that is logged in.
        database('tweets')
        .join('users', 'tweets.userID', '=', 'users.id')
        .select('tweet', 'avatar', 'timestamp', 'username')
        .where('username', username)
        .then(function(dbresult) {
          console.log("refreshed results from db")
          dbresult.reverse()
          dbresult.forEach (function(item) {
            cache.rpush("tweets", JSON.stringify(item))
          })//closes forEach
          response.render('logged-in', {username: username.toUpperCase(), tweets: dbresult});
          console.log(dbresult);
        })//closes .then(function(dbresult)
    }//closes if (cacheResult.length < 1)
    else {
      cacheResult=cacheResult.map(function(item) {
        return JSON.parse(item);
      })//closes map
      response.render('logged-in', {username: username, tweets: cacheResult});
      console.log("show results from cache");
      console.log(cacheResult);
    }//closes else
  })//closes cache.lrange()
})//closes router.get()

/*LOG OUT BY CLEARING USERNAME COOKIE*/
router.post('/logout', function(request,response){
 var username = request.cookies.username;
 var database = app.get('database');
 
 response.clearCookie("username")
 response.redirect('/');
});

/*ALLOWS LOGGED-IN USER TO SEE ANOTHER USER'S TWEETS*/
router.post('/displayTweet', function(request, response) {
  var username = request.body.otherTwit
  var database = app.get('database');

  database('tweets')
    .join('users', 'tweets.userID', '=', 'users.id')
    .select('tweet', 'avatar', 'timestamp', 'username')
    .where('username', username)
    .then(function(result) {
      result.reverse()
      response.render('logged-in', {username: username, tweets: result});
    })// closes .then(function(result) {
});// closes router.post()

/*REGISTERING A NEW USER*/
router.post('/register', function(request, response) {
  var username = request.body.username,
      password = request.body.password,
      password_confirm = request.body.password_confirm,
      email = request.body.email,
      database = app.get('database');
      var pwd = require('pwd');
      // checks to see if the username already exists in the table
      database('users').where({'username': username}).then(function(array) {
        if (array.length > 0) {
          response.render('mistake', {
            error: "Username is already taken; please try another name.",
            text: "Please click here to return to the registration page: "});
        } else {
          if (password === password_confirm) {
            // The user's registration info:
            var raw = {name:'username', password:'password'};
            // What gets stored (salt and hash TBD):
            var stored = {name:'username', salt:'', hash:''};

            function register(raw) {
              // Create and store encrypted user record:
              pwd.hash(raw.password, function(err,salt,hash) {
                stored = {name:raw.username, salt:salt, hash:hash};
                console.log(stored);
              })// closes pwd.hash()
            }// closes function register(raw)

            register(raw);

            var nonce = uuid.v4();
            response.redirect('/verify_email/' + nonce);
            //var mailBody = sendEmail(nonce, email);
            var userData = {'username': username, 'email': email, 'hash': hash, 'salt': salt};
            cache.set(nonce, JSON.stringify(userData), function() {
              //response.render('verification',
              //{text: "Thank you for registering with Twit! Please check your email for a verification link."});
              });// closes cache.set
          } else {
              response.render('mistake', {
                error: "Password confirmation did not match.",
                text: "Please click here to return to the login page: "
              });// closes response.render('mistake')
          }// closes else 
              //}// closes else
            //});// closes db check for email
        }// closes else { if password === password_confirm
      });// closes initial database query
}); // closes registration handler


/*ROUTE TO SEND VERIFICATION EMAIL*/
router.get('/verify_email/:nonce', function(request, response) {

  var database = app.get('database');

  cache.get(request.params.nonce, function(error, userData) {
    console.log(userData);
    cache.del(request.params.nonce, function() {
      if (userData) {
        userData = JSON.parse(userData);
          database('users').insert({
            username: userData.username,
            password: userData.password,
            email: userData.email,
            salt: salt,
            hash: hash
          })
          .then(function() {
            response.cookie('username', userData.username)
            response.redirect('/');
          });
      } else {
          response.render('mistake',
            {error: "That verification code is invalid!"});
        }// closes else
    });// closes cache.del;
  });// closes cache.get;
});// closes router.get;

/*ROUTE FOR EXISTING USER LOGIN*/
router.post('/login', function(request, response) {

  var username = request.body.username,
      password = request.body.password,
      database = app.get('database');

  database('users').where({'username': username}).then(function(records) {
    if (records.length === 0) {
        response.render('mistake', {
          error: "No such user",
          text: "Please click here to return to the login page: "
        });
    } else {
      var user = records[0];
      function authenticate(attempt) {
        pwd.hash(attempt.password, stored.salt, function(err,hash) {
          if (hash===stored.hash) {
            response.cookie('username', username);
            response.redirect('/');
            console.log('Success!')
          } else {
              response.render('mistake', {
                error: "It looks like your password was incorrect.",
                text: "Please click here to return to the login page: "
              });// closes response.render(mistake)
            }// closes 2nd else
        })// closes pwd.hash
      }// closes function authenticate()
    }// closes 1st else
  });// closes database request to check username
});// closes router.post

/*ROUTE FOR STORING AND POSTING TWEETS*/
router.post('/twit', function(request, response) {
  //request.body refers to the vars in the form
  var userID = request.body.userID,
      username = request.cookies.username,
      twit = request.body.twit,
      // timestamp = request.body.timestamp,
      timestamp = new Date(Date.now()),
      database = app.get('database');
//makes a req at user table, to convert username to userID
  database('users').where({'username': username})
  .then(function(records) {
    var userID = records[0].id 
//inserts vars below into tweets table
    database('tweets').insert({
      userID: userID,
      tweet: twit,
      timestamp: timestamp
    })//closes insert
//this renders the logged-in jade page w/the tweet displayed
    .then(function(result) {
      response.cookie('username', username);
      response.redirect('/')
    })//closes then function after insert
  })//closes then function records
})//closes router.post twit

module.exports = router;
