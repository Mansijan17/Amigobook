const nodemailer=require('nodemailer');
const ejs=require('ejs');
const path=require('path');

let transporter=nodemailer.createTransport({
    service:'gmail',
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    auth:{
        user:'manjarijain1998@gmail.com',
        pass:'101998Mj'
    }
});

let renderTemplate=(data,relativePath)=>{
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname,'../views/mailers',relativePath),
        data,
        function(err,template)
        {
            if(err)
            {
                console.log("error in rendering mail template ",err);
                return;
            }
            mailHTML=template;
        }
    )

    return mailHTML;
}

module.exports={
    transporter:transporter,
    renderTemplate:renderTemplate
}