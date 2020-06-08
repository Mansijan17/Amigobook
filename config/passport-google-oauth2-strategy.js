const passport=require('passport');
const googleStrategy=require('passport-google-oauth').OAuth2Strategy;
const crypto=require('crypto');
const User=require('../models/userSchema');
const env=require('./environment')
const queue=require('../config/kue');
const userEmailWorker=require('../worker/newaccount_email_worker');

let colors=["#e558e5","#e55886","#4952be","#285874","#6d721b","#99611b","#686561","#E91E63","#C62828",
           "#F57F17","#00ACC1","#512DA8","#FB8C00","#039BE5","#00b7d5"]
//tell passport to use new strategy using google login
passport.use(new googleStrategy({
    clientID:env.google_client_id,
    clientSecret:env.google_client_secret,
    callbackURL:env.google_call_back_url
    },
    function(accessToken,refreshToken,profile,done)
    {   //find the user
        User.findOne({email:profile.emails[0].value}).exec(function(err,user)
        {
            if(err)
            {
                console.log("error in google strategy passport",err);
                return;
            }
            console.log(accessToken,refreshToken);
            console.log(profile,profile.gender);
            //if found the user then set req.user as user
            if(user)
            {
                return done(null,user);
            }
            //if not found, create the user then set req.user as user
            else
            {
                let randomBgColor=colors[Math.floor(Math.random()*colors.length)];
               
                User.create({
                    name:profile.displayName,
                    email:profile.emails[0].value,
                    password:crypto.randomBytes(20).toString("hex"),
                    confirm_password:crypto.randomBytes(20).toString("hex"),
                    info:{
                        about:`Hi, I am ${profile.displayName}. Nice to meet you!`,
                        bgColor:randomBgColor
                    }
                },function(err,user)
                {
                    if(err)
                    {
                        console.log("error in craeting user using google strategy passport",err);
                        return;
                    }
                    user.notGoogle=false;
                    let job=queue.create("verifyAccount",user).save(function(err)
                    {
                            if(err)
                            {
                                console.log("error in creating a queue ",err);
                                return;
                            }
                            console.log("job enqueued ",job.id);
                    });
                    return done(null,user);
                });
            }
        });
    }

));

module.exports=passport;