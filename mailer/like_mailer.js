const nodemailer=require('../config/nodemailer');
const env=require('../config/environment');
exports.newLikeOnPostsandCommentsandReplies=(likedThing)=>{
   // console.log("inside new like on post/comment ",likedThing);
    //console.log(post.comment.content);
    let htmlString=nodemailer.renderTemplate({likedThing:likedThing},"/likes/new_like.ejs")

    nodemailer.transporter.sendMail({
        from:env.email,
        to:likedThing.email,
        subject:`${likedThing.likedUser.name} liked your ${likedThing.type}!`,
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

