var express = require('express');
var router = express.Router();
var app = require('../app')

/*
This is a request handler for loading the main page. It will check to see if
a user is logged in, and render the index page either way.
*/
router.get('/', function(request, response, next) {
  var username;
  /*
  Check to see if a user is logged in. If they have a cookie called
  "username," assume it contains their username
  */
  if (request.cookies.username) {
    var username = request.cookies.username;
    var userID = request.body.userID;
    var database = app.get('database');

    // request to only display the tweet column from the tweets table, of the user (username) that is logged in.
    database('tweets')
    .join('users', 'tweets.userID', '=', 'users.id')
    .select('tweet', 'avatar', 'timestamp', 'username')
    .where('username', username)
    .then(function(result) {
      console.log(result);
      response.render('logged-in', {username: username, tweets: result});
    })//closes then function result
    //retrieve 'select' all tweets from the tweets table, of this user
  } else {
    username = null;
    response.render('index', { username: username });
  }
  /*
  render the index page. The username variable will be either null
  or a string indicating the username.
  */
});

/*
This is the request handler for receiving a registration request. It will
check to see if the password and confirmation match, and then create a new
user with the given username.

It has some bugs:

* if someone tries to register a username that's already in use, this handler
  will blithely let that happen.
* If someone enters an empty username and/or password, it'll accept them
  without complaint.
*/
router.post('/register', function(request, response) {
/*
request.body is an object containing the data submitted from the form.
Since we're in a POST handler, we use request.body. A GET handler would use
request.params. The parameter names correspond to the "name" attributes of
the form fields.

app.get('database') returns the knex object that was set up in app.js. app.get
is not the same as router.get; it's more like object attributes. You could
think of it like it's saying app.database, but express apps use .get and .set
instead of attributes to avoid conflicts with the attributes that express apps
already have.
*/
  var username = request.body.username,
      password = request.body.password,
      password_confirm = request.body.password_confirm,
      database = app.get('database');

      database('users').where({'username': username}).then(function(array) {
        if (array.length > 0) {
          response.render('mistake', {
            error: "Username is already taken; please try another name.",
            text: "Please click here to return to the login page: "
          })
        } else {
          if (password === password_confirm) {
/*
This will insert a new record into the users table. The insert
function takes an object whose keys are column names and whose values
are the contents of the record.

This uses a "promise" interface. It's similar to the callbacks we've
worked with before. insert({}).then(function() {...}) is very similar
to insert({}, function() {...});
*/
            database('users').insert({
              username: username,
              password: password,
            })
            .then(function() {
/*
Here we set a "username" cookie on the response. This is the cookie
that the GET handler above will look at to determine if the user is
logged in.

Then we redirect the user to the root path, which will cause their
browser to send another request that hits that GET handler.
*/
              response.cookie('username', username)
              response.redirect('/');
            });
          } else {
/*
The user mistyped either their password or the confirmation, or both.
Render the index page again, with an error message telling them what's
wrong.
*/
              response.render('mistake', {
                error: "Password confirmation did not match.",
                text: "Please click here to return to the login page: "
              });//end of render pwd no match
          }//end of password matching 'else' statement 
        }//end of username query 'else' statement
      }); //end of initial database query
}); //end of route

/*
This is the request handler for logging in as an existing user. It will check
to see if there is a user by the given name, then check to see if the given
password matches theirs.

Given the bug in registration where multiple people can register the same
username, this ought to be able to handle the case where it looks for a user
by name and gets back multiple matches. It doesn't, though; it just looks at
the first user it finds.
*/
router.post('/login', function(request, response) {
  /*
  Fetch the values the user has sent with their login request. Again, we're
  using request.body because it's a POST handler.

  Again, app.get('database') returns the knex object set up in app.js.
  */
  var username = request.body.username,
      password = request.body.password,
      database = app.get('database');


  /*
  This is where we try to find the user for logging them in. We look them up
  by the supplied username, and when we receive the response we compare it to
  the supplied password.
  */
  database('users').where({'username': username}).then(function(records) {
    /*
    We didn't find anything in the database by that username. Render the index
    page again, with an error message telling the user what's going on.
    */
    if (records.length === 0) {
        response.render('mistake', {
          error: "No such user",
          text: "Please click here to return to the login page: "
        });
    } else {
      var user = records[0];
      if (user.password === password) {
        /*
        Hey, we found a user and the password matches! We'll give the user a
        cookie indicating they're logged in, and redirect them to the root path,
        where the GET request handler above will look at their cookie and
        acknowledge that they're logged in.
        */
        response.cookie('username', username);
        response.redirect('/');
      } else {
        /*
        There's a user by that name, but the password was wrong. Re-render the
        index page, with an error telling the user what happened.
        */
        response.render('mistake', {
          error: "Password incorrect",
          text: "Please click here to return to the login page: "
        });
      }
    }
  });
});

/*route for storing/posting tweets*/
// look at the loop in the my first blog template

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
