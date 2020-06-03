const nodemailer=require('../config/nodemailer');
const env=require('../config/environment');

exports.newFriendRequestRecieved=(s_n_r)=>{
    console.log(s_n_r);
    let htmlString=nodemailer.renderTemplate({reciever:s_n_r.reciever,sender:s_n_r.sender},"/friendrequest/new_friend_req.ejs")

    nodemailer.transporter.sendMail({
        from:env.email,
        to:s_n_r.reciever.email,
        subject:"New Friend Request!",
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
