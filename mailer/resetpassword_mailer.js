const nodemailer=require('../config/nodemailer');

exports.newPassword=(newpassword)=>{
    //console.log("inside new password ",newpassword);
    let htmlString=nodemailer.renderTemplate({newpassword:newpassword},"/newpassword/new_password.ejs");

    nodemailer.transporter.sendMail({
        from:"manjarijain98@gmail.com",
        to:newpassword.user.email,
        subject:"Reset Password Link",
        html:htmlString
    },(err,info)=>{
        if(err)
        {
            console.log("Error in sending mail for new password ",err);
            return;
        }
        return;
    })
}

exports.updatedPassword=(user)=>{
    //console.log("inside new password ",newpassword);
    let htmlString=nodemailer.renderTemplate({user:user},"/newpassword/confirm_password.ejs");

    nodemailer.transporter.sendMail({
        from:"manjarijain98@gmail.com",
        to:user.email,
        subject:"Password Updated Successfully!",
        html:htmlString
    },(err,info)=>{
        if(err)
        {
            console.log("Error in sending mail for new password ",err);
            return;
        }
        return;
    })
}