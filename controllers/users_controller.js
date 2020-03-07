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
    var pwd=req.body.pwd;
    var pwd2=req.body.pwd2;
    if(pwd!=pwd2)
    {
        return res.redirect("back");
    }

    User.findOne({email:req.body.email},function(err,user)
    {
        if(err)
        {
            console.log("Error in finding user in signing up");
            return;
        }
        if(!user)
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
                return res.redirect("/users/signin");
        
            });

        }
        else
        {
            return res.redirect("back");
        }
        
    });

  
}

//create the session for the signed in user
module.exports.createSession=function(req,res)
{
   

}