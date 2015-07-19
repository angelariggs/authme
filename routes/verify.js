var nodemailer = require('nodemailer');

 
// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'riggs.ang@gmail.com',
        pass: 'PASSWORD'
    }
}); 
 
// setup e-mail data with unicode symbols 
function sendValidationEmail (nonce, email) {
  var mailOptions = {
      from: 'Angela Riggs ✔ <riggs.ang@gmail.com>', // sender address 
      to: email, // list of receivers 
      subject: 'Thanks for Registering', // Subject line 
      text: 'Here is your code:', // plaintext body 
      html: '<a href="http://localhost:3000/verify_email/' + nonce + '"> Click here to complete your registration on Twit!</a>' // html body 
  };

 
// send mail with defined transport object 
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      } else{
          console.log('Message sent: ' + info.response);
      }
  });
}

module.exports=sendValidationEmail

