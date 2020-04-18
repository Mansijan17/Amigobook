const User = require('../models/userSchema');
const Post=require('../models/post');
const fs = require('fs');
const path = require('path');
const ResetPassword=require('../models/resetPasswordSchema');
const newpasswordMailer=require('../mailer/resetpassword_mailer');
const queue=require('../config/kue');
const newpasswordEmailWorker=require('../worker/newpassword_email_worker');
const crypto=require('crypto');
const Friendship=require('../models/friendship');
const newAccount=require('../models/newAccountSchema');
const newaccountEmailWorker=require('../worker/newaccount_email_worker');
//making function async
module.exports.profile = async function (req, res) {
    try
    {
       // console.log(req.params.id);
        let user=await User.findById(req.params.id);
        let postLists=await Post.find({user:user.id}).sort("-createdAt").populate("user").populate({
            //populating the comments of the post schema
            //Change:: populate the likes of the posts and comments
            path:"comments",
            populate:
                {
                    path:"likes",
                    populate:{
                        path:"user"
                    }
                  
                },
            
        }).populate({
            path:"likes",
            populate:{
                path:"user"
            }
        });
        //console.log(postLists);

       // console.log("profile user posts ",user.posts);
        return res.render('userProfile', {
            title: 'User Profile',
            profileUser: user,
            posts:postLists
        })

    }
    catch(err)
    {
        console.log("error in rendering profile ",err);
        return;
    }
    
}

module.exports.update = async function (req, res) {
    // if(req.user.id==req.params.id)
    // {
    //     User.findByIdAndUpdate(req.params.id,req.body,function(err,user)
    //     {
    //         req.flash("success","Updated!");
    //         return res.redirect("back");
    //     })

    // }
    // else
    // {
    //    req.flash("error","Unauthorized!");
    //     return res.status(401).send("Unauthorised");
    // }

    if (req.user.id == req.params.id) {
        try {
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req, res, function (err) {
                if (err) {
                    console.log("****Multer ", err);
                }
                //console.log(req.file);
                user.name = req.body.name;
                user.email = req.body.email;
                console.log("file ", req.file);
                // console.log("User: ",user);
                if (req.file) {
                    if (user.avatar) {
                        if (fs.existsSync(path.join(__dirname, "..", user.avatar))) {
                            //console.log("deleted!");
                            //console.log(path.join(__dirname, "..", user.avatar));
                            fs.unlinkSync(path.join(__dirname, "..", user.avatar));
                        }
                        user.avatar = User.avatarPath + "/" + req.file.filename;

                    } else {
                        user.avatar = User.avatarPath + "/" + req.file.filename;
                    }

                    //this is saving the path of the file in the avatar field of the user

                    //console.log(user);   
                }
                user.save();
                req.flash("success", "Updated!");
                return res.redirect("back");
            })
        }
        catch (err) {
            req.flash("error", err);
            return res.redirect("back");
        }
    }
    else {
        req.flash("error", "Unauthorized!");
        return res.status(401).send("Unauthorised");
    }
}


// render the sign up page
module.exports.signUp = function (req, res) {
    if (req.isAuthenticated()) {
      //  req.flash("success", "Successfully resgistered!");
        return res.redirect("/");
    }
   // req.flash("error", "Invalid details!");
    return res.render('userSignUp', {
        title: "Socialends | Sign Up"
    })
}


// render the sign in page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return res.render('userSignIn', {
        title: "Socialends | Sign In"
    })
}

// get the sign up data
module.exports.create = async function (req, res) {
    if (req.body.password != req.body.confirm_password) {
        req.flash("error", "Invalid passwords!");
        return res.redirect('back');
    }

    // User.findOne({email: req.body.email}, function(err, user){
    //     if(err){console.log('error in finding user in signing up'); return}

    //     if (!user){
    //         User.create(req.body, function(err, user){
    //             if(err){console.log('error in creating user while signing up'); return}
    //             console.log("new user",user);
    //             return res.redirect('/users/sign-in');
    //         })
    //     }else{
    //         return res.redirect('back');
    //     }

    // });
    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            //await User.create(req.body);
            let newuser={
                user:req.body,
                acessToken:crypto.randomBytes(20).toString("hex")
            }
            //console.log(newuser);
            let newaccountUser=await newAccount.create(newuser);
            console.log(newaccountUser);
            let job=queue.create("newAccount",newuser).save(function(err)
            {
                if(err)
                {
                    console.log("error in creating a queue ",err);
                    return;
                }
                console.log("job enqueued ",job.id);
            });
            req.flash("success", "Check your email for verification!");
            return res.redirect('/');
        }
        else {
            req.flash("error", "Email id already exists!");
            return res.redirect('back');
        }
    }
    catch (err) {
        console.log("Error: ", err);
        return;
    }
}


// sign in and create a session for the user
module.exports.createSession = function (req, res) {
    req.flash("success", "Logged in Successfully");
    return res.redirect('/');
}


module.exports.destroySession = function (req, res) {
    req.logout();
    req.flash("success", "You are logged out");
    return res.redirect("/");
}

module.exports.forgetPassword=function(req,res)
{
    return res.render("forgetPassword",{
        title:"Socialend | Forget Password"
    });
}

module.exports.resetPasswordEmailLink=async function(req,res)
{
    try {
        //console.log(req.body);
        let userFound = await User.findOne({ email: req.body.email });
        if (!userFound) {
            req.flash("error","No email found!");
            return res.redirect('/users/sign-in');
        }
        else {
            //console.log(userFound);
            let newpassword=await ResetPassword.create({
                isvalid:true,
                user:userFound._id,
                acessToken:crypto.randomBytes(20).toString("hex"),
            });
            newpassword=await newpassword.populate("user","name email").execPopulate();
            console.log(newpassword);
            let job=queue.create("password",newpassword).save(function(err)
            {
                if(err)
                {
                    console.log("error in creating a queue ",err);
                    return;
                }
                console.log("job enqueued ",job.id);
            });
            req.flash("success","Reset link send to the email!");
            return res.redirect("/users/sign-in");
        }
    }
    catch (err) {
        console.log("Error: ", err);
        return;
    }
}

module.exports.newPassword=function(req,res)
{
    var id=req.params.id;
    //console.log(id);
    return res.render("new_confirm_password",{
        title:"Socialend | New Password",
        acessToken:id
    });
}

module.exports.resetPassword=async function(req,res)
{
    try
    {
        let acessToken=req.params.id;
        let resetPasswordSchema=await ResetPassword.findOne({acessToken:acessToken});
        //console.log(resetPasswordSchema);
        if(resetPasswordSchema)
        {
            let user=await User.findById(resetPasswordSchema.user);
            //console.log(user);
            if(resetPasswordSchema.isvalid)
            {
                if(req.body.newpassword==req.body.confirmpassword)
                {
                    user.password=req.body.newpassword;
                    user.save();
                   // console.log(user);
                    resetPasswordSchema.isvalid=false;
                    resetPasswordSchema.save();
                    req.flash("success","Password Updated!");
                    return res.redirect("/users/sign-in");
                }
                else
                {
                    resetPasswordSchema.isvalid=false;
                    resetPasswordSchema.save();
                    req.flash("error","Passwords dont match!");
                    return res.redirect("/"); 
                }
                
            }
            else
            {
                req.flash("error","Token expire!");
                return res.redirect("/");
            }
        }
        
    }
    catch(err)
    {
        console.log("Error: ", err);
        return;
    }
    
}

module.exports.toggleFriendship=async function(req,res)
{
    try
    {
        //users/add-friends/?from=user.id&to=friend.id
        //console.log(req.query);
        let deleted=false;
        let existingFriendshipFrom=await Friendship.findOne({
            fromUser:req.query.from,
            toUser:req.query.to
        });
        let existingFriendshipTo=await Friendship.findOne({
            fromUser:req.query.to,
            toUser:req.query.from
        });
        let fromUser=await User.findById(req.query.from);
        let toUser=await User.findById(req.query.to);
        if(existingFriendshipFrom)
        {
            console.log("Exits");
            existingFriendshipFrom.remove();
            existingFriendshipTo.remove();
            fromUser.friendships.pull(existingFriendshipFrom._id);
            fromUser.save();
            toUser.friendships.pull(existingFriendshipTo._id);
            toUser.save();
            deleted=true;
        }
        else
        {
            let newFriendshipFrom=await Friendship.create({
                fromUser:req.query.from,
                toUser:req.query.to
            });
            let newFriendshipTo=await Friendship.create({
                fromUser:req.query.to,
                toUser:req.query.from
            });
           // console.log(newFriendship);
            fromUser.friendships.push(newFriendshipFrom);
            fromUser.save();
            toUser.friendships.push(newFriendshipTo);
            toUser.save();
        }

       console.log("from " ,fromUser);
       console.log("to " ,toUser);
       
        return res.redirect("/");
        // return res.json(500,{
        //     message:"Request successfull!",
        //     data:
        //     {
        //         deleted:deleted,
        //         friendship:fromUser.friendships
        //     }
        // })
    }
    catch(err)
    {
        //console.log(err);
        // req.flash("error ",err);
         return res.json(500,{
             message:"Interval Server Error",
         });
    }
}

module.exports.confirmAccount=function(req,res)
{
    var id=req.params.id;
    console.log("confirm account");
    return res.render("confirmAccount",{
        title:"Socialend | Confirm Account",
        acessToken:id
    });
}