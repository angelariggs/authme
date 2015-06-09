var nodemailer = require('nodemailer');

 
// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'riggs.ang@gmail.com',
        pass: 'kraft423'
    }
});
 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails 
 
// setup e-mail data with unicode symbols 
function sendValidationEmail (nonce) {
  var mailOptions = {
      from: 'Angela Riggs ✔ <riggs.ang@gmail.com>', // sender address 
      to: email, // list of receivers 
      subject: 'Thanks for Registering', // Subject line 
      text: 'Here is your code:', // plaintext body 
      html: '<a href="/verify_email/' + nonce + '"> Click here!</a>' // html body 
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

