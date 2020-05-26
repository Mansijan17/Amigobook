const nodemailer=require('../config/nodemailer');

// this is another way of exporting method

exports.newPost=(post)=>{
    //console.log("inside new post ",post);
    let htmlString=nodemailer.renderTemplate({post:post},"/posts/new_post.ejs")

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
        to:post.user.email,
        subject:"New post published!",
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

exports.NewShareOnPost=(post)=>{
    //console.log("inside new share on post ",post);

    let htmlString=nodemailer.renderTemplate({post:post},"/posts/share_post.ejs")

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
        to:post.email,
        subject:`${post.sharedUserName} shared your post!`,
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