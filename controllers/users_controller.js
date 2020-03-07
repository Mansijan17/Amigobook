module.exports.signIn=function(req,res)
{
    return res.render("userSignIn",{
        title:"Codeial: Sign In"
    });
}

module.exports.profile=function(req,res)
{
    return res.render("userProfile",{
        title:"User"
    });
    //return res.end("<h1>Express2 is up for Codeial</h1>")
}
module.exports.signUp=function(req,res)
{
   // console.log("sign up");
    return res.render("userSignUp",{
        title:"Codeial: Sign Up"
    });
}
//const db=require("../config/mongoose");
const User=require("../models/userSchema");


//get the signup data
module.exports.createUser=function(req,res)
{
    User.create({
        email:req.body.email,
        password:req.body.pwd,
        name:req.body.name
    },function(err,newUser)
    {
        if(err)
        {
            console.log("Error on creating a new user");
            return;
        }
        console.log(newUser);
        return res.redirect("/");

    });
}

//create the session for the signed in user
module.exports.createSession=function(req,res)
{

}