const nodemailer=require('nodemailer');
const ejs=require('ejs');
const path=require('path');

let transporter=nodemailer.createTransport({
    service:'gmail',
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    auth:{
        user:'manjarijain98@gmail.com',
        password:'Manjari1998#'
    }
});

let renderTemplate=(data,relativePath)=>{
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname,'../views/mailer',relativePath),
        data,
        function(err,template)
        {
            if(err)
            {
                console.log("error in rendering mail template");
                return;
            }
            mailHTML=template;
        }
    )

    return mailHTML;
}

module.exports={
    transporter:transporter,
    renderFile:renderFile
}