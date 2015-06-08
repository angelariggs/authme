    if (!password || !username) {
            response.render('mistake', {
              error: "Please fill out all fields completely.",
              text: "Please click here to return to the login page: "
            })//closes response.render
            return
          }//closes if


Richard Johnson [2:58 PM]
router.post('/logout', function(request,response){
 var username = request.cookies.username;
 response.clearCookie("username")
 response.redirect('/');

})

Richard Johnson [2:59 PM]
form(method='post' action='/logout')  
   input(type='submit', name='logout', value="logout",id=log Out)


   usernames are case sensitive

   'logout' adds a blank tweet