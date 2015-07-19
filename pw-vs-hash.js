function authenticate(attempt) {
  pwd.hash(attempt.password, stored.salt, function(err,hash) {
    if (hash===stored.hash)
    console.log('Success!')
  })
}


if (user.password === password) {
        response.cookie('username', username);
        response.redirect('/');
      } 