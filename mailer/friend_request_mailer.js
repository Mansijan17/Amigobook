const nodemailer=require('../config/nodemailer');


exports.newFriendRequestRecieved=(s_n_r)=>{
    console.log(s_n_r);
    let htmlString=nodemailer.renderTemplate({reciever:s_n_r.reciever,sender:s_n_r.sender},"/friendrequest/new_friend_req.ejs")

    nodemailer.transporter.sendMail({
        from:"manjarijain1998@gmail.com",
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
