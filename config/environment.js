const fs = require('fs');
const rfs = require('rotating-file-stream');
const path = require('path');


const logDirectory = path.join(__dirname, '../production_logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accesslogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory
});



const development={
    name:"development",
    asset_path:"/assets",
    session_cookie_key:"blahsomething",
    db:"codeial_developement",
    smtp:{
        service:'gmail',
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        auth:{
            user:'manjarijain1998@gmail.com',
            pass:'101998Mj'
        }
    },
    google_client_id:"277058453568-l24k6eqhmfi696gn75g71oskubkm0l18.apps.googleusercontent.com",
    google_client_secret:"vZaDWh1SxGf0PHetHISeZu_X",
    google_call_back_url:"http://localhost:8000/users/auth/google/callback",
    jwt_secret:"codeial",
    morgan:{
        mode:"dev",
        options:{
            stream:accesslogStream
        }
    },
}

const production={
    name:"production",
    asset_path:process.env.CODEIAL_ASSET_PATH,
    session_cookie_key:process.env.CODEIAL_SESSION_COOKIE_KEY,//from randomkeygen.com
    db:process.env.CODEIAL_DB,
    smtp:{
        service:'gmail',
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        auth:{
            user:process.env.CODEIAL_GMAIL_USERNAME,
            pass:process.env.CODEIAL_GMAIL_PASSWORD
        }
    },
    google_client_id:process.env.CODEIAL_GOOGLE_CLIENT_ID,
    google_client_secret:process.env.CODEIAL_GOOGLE_CLIENT_SECRET,
    google_call_back_url:process.env.CODEIAL_GOOGLE_CALLBACK_URL,
    jwt_secret:process.env.CODEIAL_JWT_SECRET,//from randomkeygen.com
    morgan:{
        mode:"combined",
        options:{
            stream:accesslogStream
        }
    },
}

module.exports=eval(process.env.CODEIAL_ENVIRONMENT)==undefined ? development : eval(process.env.CODEIAL_ENVIRONMENT);

