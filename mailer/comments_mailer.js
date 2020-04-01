const nodemailer=require('../config/nodemailer');

// this is another way of exporting method

exports.newComment=(comment)=>{
    console.log("inside new comment ",comment);

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
        to:comment.user.email,
        subject:"New comment published!",
        html:"<h1>Yup, your comment is now published </h1>"
    }, (err,info)=>{
        if(err)
        {
            console.log("Error in sending mail ",err);
            return;
        }
        console.log("Email sent ",info);
        return;
    });
}
