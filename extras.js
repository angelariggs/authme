if (!password || !username) {
  response.render('mistake', {
  user: null,
  error: "Fill copmletel"
  text: 
  });
  return
}


Richard Johnson [2:58 PM]
router.post('/logout', function(request,response){
 var username = request.cookies.username;
 response.clearCookie("username")
 response.redirect('/');

})

Richard Johnson [2:59 PM]
form(method='post' action='/logout')  
   input(type='submit', name='logout', value="logout",id=log Out)