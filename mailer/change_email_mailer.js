const nodemailer=require('../config/nodemailer');
const env=require('../config/environment');
exports.changeEmail=(user)=>{
    //console.log("inside new user ",newuser.user,newuser.acessToken);
    let htmlString=nodemailer.renderTemplate({user:user},"/change_email/change_email.ejs");

    nodemailer.transporter.sendMail({
        from:env.email,
        to:user.email,
        subject:"Request to Change the Email Address!",
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

exports.changeEmailConfirm=(user)=>{
    //console.log("inside new user ",newuser.user,newuser.acessToken);
    let htmlString=nodemailer.renderTemplate({user:user.user},"/change_email/change_email_confirm.ejs");

    nodemailer.transporter.sendMail({
        from:env.email,
        to:user.oldEmail,
        subject:"Email Address Successfully Updated!",
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