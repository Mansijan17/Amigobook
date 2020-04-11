const passport=require('passport');
const googleStrategy=require('passport-google-oauth').OAuth2Strategy;
const crypto=require('crypto');
const User=require('../models/userSchema');
const env=require('./environment')


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
            console.log(profile);
            //if found the user then set req.user as user
            if(user)
            {
                return done(null,user);
            }
            //if not found, create the user then set req.user as user
            else
            {
                User.create({
                    name:profile.displayName,
                    email:profile.emails[0].value,
                    password:crypto.randomBytes(20).toString("hex")
                },function(err,user)
                {
                    if(err)
                    {
                        console.log("error in craeting user using google strategy passport",err);
                        return;
                    }
                    return done(null,user);
                });
            }
        });
    }

));

module.exports=passport;