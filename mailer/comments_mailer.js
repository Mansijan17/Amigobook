const nodemailer=require('../config/nodemailer');

// this is another way of exporting method

exports.newCommentandReply=(expressThoughts)=>{
    //console.log("inside new comment ",expressThoughts);
    let htmlString=nodemailer.renderTemplate({expressThoughts:expressThoughts},"/comments_replies/new_comment_reply.ejs")

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
        to:expressThoughts.thought.user.email,
        subject:`New ${expressThoughts.type} published!`,
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
   // console.log("inside new comment on post ",post);

    let htmlString=nodemailer.renderTemplate({post:post,comment:post.comment},"/posts/new_comment_on_post.ejs")

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
        to:post.email,
        subject:`${post.comment.user.name} posted new comment on your post!`,
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

exports.newReplyOnComment=(comment)=>{
    // console.log("inside new comment on post ",post);
 
     let htmlString=nodemailer.renderTemplate({comment:comment,reply:comment.reply},"/comments_replies/new_reply_on_comment.ejs")
 
     nodemailer.transporter.sendMail({
         from:"manjarijain1998@gmail.com",
         to:comment.email,
         subject:`${comment.reply.user.name} posted new reply on your comment!`,
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

 exports.newReplyOnReply=(thought)=>{
    // console.log("inside new comment on post ",post);
 
     let htmlString=nodemailer.renderTemplate({oldReply:thought,reply:thought.reply},"/comments_replies/new_reply_on_reply.ejs")
 
     nodemailer.transporter.sendMail({
         from:"manjarijain1998@gmail.com",
         to:thought.email,
         subject:`${thought.reply.user.name} posted new reply on your thought!`,
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