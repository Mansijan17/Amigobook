const nodemailer=require('../config/nodemailer');

// this is another way of exporting method

exports.newComment=(comment)=>{
    console.log("inside new comment ",comment);
    let htmlString=nodemailer.renderTemplate({comment:comment},"/comments/new_comment.ejs")

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
        to:comment.comment.user.email,
        subject:"New comment published!",
        html:htmlString
    }, (err,info)=>{
        if(err)
        {
            console.log("Error in sending mail ",err);
            return;
        }
       // console.log("Email sent ",info);
        return;
    });
}

exports.newCommentOnPost=(post)=>{
    console.log("inside new comment on post ",post);
    console.log(post.comment.content);
    let htmlString=nodemailer.renderTemplate({post:post,comment:post.comment},"/posts/new_comment_on_post.ejs")

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
        to:post.email,
        subject:"New comment on your post "+post.content+"!",
        html:htmlString
    }, (err,info)=>{
        if(err)
        {
            console.log("Error in sending mail ",err);
            return;
        }
       // console.log("Email sent ",info);
        return;
    });
}