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
}

const production={
    name:"production"
}

module.exports=development;