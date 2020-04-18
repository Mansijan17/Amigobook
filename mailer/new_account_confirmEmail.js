const nodemailer=require('../config/nodemailer');

exports.newAccount=(newuser)=>{
    console.log("inside new user ",newuser.user,newuser.acessToken);
    let htmlString=nodemailer.renderTemplate({newuser:newuser.user,acessToken:newuser.acessToken},"/new_account/new_account_confirm_email.ejs");

    nodemailer.transporter.sendMail({
        from:"manjarijain98@gmail.com",
        to:newuser.user.email,
        subject:"Confirmation Link For Account Verification",
        html:htmlString
    },(err,info)=>{
        if(err)
        {
            console.log("Error in sending mail for new account ",err);
            return;
        }
       // console.log("Email sent: ",info);
        return;
    })
}