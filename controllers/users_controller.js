const User = require('../models/userSchema');
const Post=require('../models/post');
const fs = require('fs');
const path = require('path');
const ResetPassword=require('../models/resetPasswordSchema');
//const newpasswordMailer=require('../mailer/resetpassword_mailer');
const queue=require('../config/kue');
const newpasswordEmailWorker=require('../worker/newpassword_email_worker');
const newFriendReqWorker=require('../worker/friend_request_email_worker');
const crypto=require('crypto');
const Friendship=require('../models/friendship');
const FriendshipForm=require('../models/pend_friend_forms');
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
        }).populate({
            path:"shares",
            options:{
                sort:"-createdAt"
            },
            populate:{
                path:"user"
            }
        });;

        for(post of postLists)
        {
            post.update=false;
            post.save();
            for(comment of post.comments)
            {
                comment.update=false;
                comment.save();
            }
        }
        let friendships=user.friendships;
        let friends=[];
        let mutualfriends=[];
        for(friendship of friendships)
        {
            let ship=await Friendship.findById(friendship._id);
            friends.push(ship.toUser);
        }
        friends.reverse();
        let friended;
        let pendingFrom;
        let pendingTo;
        if(req.user.id!=req.params.id)
        {
            friended=false;
            pendingFrom=false;
            pendingTo=false;
            let loggeduser=await User.findById(req.user.id);
            let friendships=loggeduser.friendships;
            for(friendship of friendships)
            {
                let ship=await Friendship.findById(friendship._id);
                if(ship.toUser!=null)
                {
                    for(friend of friends)
                    {
                        if(friend.id!=req.user.id && friend.id==ship.toUser.id)
                        {
                            mutualfriends.push(friend);
                        }
                    }
                }
            }
            mutualfriends.reverse()
            let findFriendship=await Friendship.findOne({fromUser:req.user.id,toUser:req.params.id});
            if(findFriendship)
            {
                friended=true;
            }
            else
            {
                let pendingFriend=await FriendshipForm.findOne({fromUser:req.user.id,toUser:req.params.id});
                if(pendingFriend)
                {
                    pendingFrom=true;
                }
                let pendingFriend2=await FriendshipForm.findOne({fromUser:req.params.id,toUser:req.user.id});
                if(pendingFriend2)
                {
                    pendingTo=true;
                }
                console.log(pendingFrom,pendingTo)
            }
        }
        

        return res.render('userProfile', {
            title: `${user.name} | Skyinyou`,
            profileUser: user,
            posts:postLists,
            friends:friends,
            mutualfriends:mutualfriends,
            friended:friended,
            pendingFrom:pendingFrom,
            pendingTo:pendingTo
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
        title: "Skyinyou | Sign Up"
    })
}


// render the sign in page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return res.render('userSignIn', {
        title: "Skyinyou | Sign In"
    })
}

// get the sign up data
module.exports.create = async function (req, res) {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            //await User.create(req.body);
            if (req.body.password != req.body.confirm_password) {
                return res.json(200,{
                    data:{
                        message:"These two passwords don't see eye to eye!",
                        error:true
                    }
                })
                req.flash("error", "These two passwords don't see eye to eye!");
                return res.redirect('back');
            }
            if(req.body.password.length<8)
            {
                console.log("len");
                return res.json(200,{
                    data:{
                        message:"Come on, give some length to the password!",
                        error:true
                    }
                })
                req.flash("error", "Come on, give some length to the password!");
                return res.redirect('back');
            }
            let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
            let specialCharacter=false;
            let number=false;
            let letter=false;
            let captial=false;
            for(let i=0;i<req.body.password.length;i++)
            {
                if(format.test(req.body.password.charAt(i)))
                {
                    specialCharacter=true;
                }
                else
                {
                    if(isNaN(req.body.password.charAt(i)))
                    {
                        letter=true;
                        if(req.body.password.charAt(i)==req.body.password.charAt(i).toUpperCase())
                        {
                            captial=true;
                        }
                    }
                    else
                    {
                        number=true;
                    }
                }
            }
            if(!specialCharacter)
            {
                console.log("sp");
                return res.json(200,{
                    data:{
                        message:"Oh, you missed special characters in password!",
                        error:true
                    }
                })
                req.flash("error", "Oh, you missed special characters in password!");
                return res.redirect('back');
            }
            if(!number)
            {
                console.log("no");
                return res.json(200,{
                    data:{
                        message:"A number makes your password stronger!",
                        error:true
                    }
                })
                req.flash("error", "A number makes your password stronger!");
                return res.redirect('back');
            }
            if(!letter)
            {
                console.log("letter");
                return res.json(200,{
                    data:{
                        message:"The password can't be spelled without letters!",
                        error:true
                    }
                })
                req.flash("error", "The password can't be spelled without letters!");
                return res.redirect('back');
            }
            if(!captial)
            {
                console.log("cap");
                return res.json(200,{
                    data:{
                        message:"At least one letter of your password needs respect!",
                        error:true
                    }
                })
                req.flash("error", "At least one letter of your password needs respect!");
                return res.redirect('back');
            }
            let name=req.body.name;
            let name2=[];
            name=name.split(" ");
            for (let word of name) {
                word=word.charAt(0).toUpperCase() + word.slice(1);
                name2+=word+" ";
            }
            name2=name2.trim();
            console.log(name2);
            req.body.name=name2;
           
            let newuser={
                user:req.body,
                acessToken:crypto.randomBytes(20).toString("hex")
            }
          //console.log(newuser);
            let newAccountSchema=await newAccount.findOne({"user.email":req.body.email});
            //console.log(newAccountSchema);
            if(!newAccountSchema)
            {
                console.log(newuser);
                await newAccount.create(newuser);
            }
            else
            {
                newAccountSchema.acessToken=newuser.acessToken;
                newAccountSchema.user=req.body;
                newAccountSchema.save();
            }
            // let newaccountUser=await newAccount.create(newuser);
            // console.log(newaccountUser);
            let job=queue.create("newAccount",newuser).save(function(err)
            {
                if(err)
                {
                    console.log("error in creating a queue ",err);
                    return;
                }
                console.log("job enqueued ",job.id);
            });
            return res.json(200,{
                data:{
                    message:"Your @ chariot awaits!",
                    error:false
                }
            })
            req.flash("success", "Your @ chariot awaits!");
            return res.redirect('/');
        }
        else {
            return res.json(200,{
                data:{
                    message:"This @ is already among the skies!",
                    error:true
                }
            })
            req.flash("error", "This @ is already among the skies!");
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
 
    req.flash("success", "Ascented Chivalrously!");
    return res.redirect('/');
}


module.exports.destroySession = function (req, res) {
    req.logout();
    req.flash("success", "Descented Reminiscently!");
    return res.redirect("/");
}

module.exports.forgetPassword=function(req,res)
{
    return res.render("forgetPassword",{
        title:"Skyinyou | Forget Password"
    });
}

module.exports.resetPasswordEmailLink=async function(req,res)
{
    try {
        //console.log(req.body);
        let userFound = await User.findOne({ email: req.body.email });
        if (!userFound) {
            return res.json(200,{
                data:{
                    message:"This @ is still on earth!",
                    error:true
                }
            })
            req.flash("error","This @ is still on earth!");
            return res.redirect('/users/sign-in');
        }
        else {
            //console.log(userFound);
            let resetPasswordSchema=await ResetPassword.findOne({user:userFound._id});
            if(!resetPasswordSchema)
            {
                resetPasswordSchema=await ResetPassword.create({
                    isvalid:true,
                    user:userFound._id,
                    acessToken:crypto.randomBytes(20).toString("hex"),
                });
            }
            else
            {
                resetPasswordSchema.isvalid=true;
                resetPasswordSchema.acessToken=crypto.randomBytes(20).toString("hex");
                resetPasswordSchema.save();
            }
            
            resetPasswordSchema=await resetPasswordSchema.populate("user","name email").execPopulate();
            console.log(resetPasswordSchema);
            let job=queue.create("password",resetPasswordSchema).save(function(err)
            {
                if(err)
                {
                    console.log("error in creating a queue ",err);
                    return;
                }
                console.log("job enqueued ",job.id);
            });
            return res.json(200,{
                data:{
                    message:"Your @ has a new tweet!",
                    error:false
                }
            })
            req.flash("success","Your @ has a new tweet!");
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
        title:"Skyinyou | New Password",
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
                    if(user.password==req.body.newpassword)
                    {
                        resetPasswordSchema.isvalid=false;
                        resetPasswordSchema.save();
                        return res.json(200,{
                            data:{
                                message:"Uh-Oh! This enigma is used recently!",
                                error:true
                            }
                        })
                        req.flash("error","Uh-Oh! This enigma is used recently!");
                        return res.redirect("/");
                    }
                    else
                    {
                                if(req.body.newpassword.length<8)
                                {
                                    console.log("len");
                                    resetPasswordSchema.isvalid=false;
                                    resetPasswordSchema.save();
                                    return res.json(200,{
                                        data:{
                                            message:"Come on, give some length to the password!",
                                            error:true
                                        }
                                    })
                                    req.flash("error", "Come on, give some length to the password!");
                                    return res.redirect('back');
                                }
                                let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                                let specialCharacter=false;
                                let number=false;
                                let letter=false;
                                let captial=false;
                                for(let i=0;i<req.body.newpassword.length;i++)
                                {
                                    if(format.test(req.body.newpassword.charAt(i)))
                                    {
                                        specialCharacter=true;
                                    }
                                    else
                                    {
                                        if(isNaN(req.body.newpassword.charAt(i)))
                                        {
                                            letter=true;
                                            if(req.body.newpassword.charAt(i)==req.body.newpassword.charAt(i).toUpperCase())
                                            {
                                                captial=true;
                                            }
                                        }
                                        else
                                        {
                                            number=true;
                                        }
                                    }
                                }
                                if(!specialCharacter)
                                {
                                    console.log("sp");
                                    resetPasswordSchema.isvalid=false;
                                    resetPasswordSchema.save();
                                    return res.json(200,{
                                        data:{
                                            message:"Oh, you missed special characters in password!",
                                            error:true
                                        }
                                    })
                                    req.flash("error", "Oh, you missed special characters in password!");
                                    return res.redirect('back');
                                }
                                if(!number)
                                {
                                    console.log("no");
                                    resetPasswordSchema.isvalid=false;
                                    resetPasswordSchema.save();
                                    return res.json(200,{
                                        data:{
                                            message:"A number makes your password stronger!",
                                            error:true
                                        }
                                    })
                                    req.flash("error", "A number makes your password stronger!");
                                    return res.redirect('back');
                                }
                                if(!letter)
                                {
                                    resetPasswordSchema.isvalid=false;
                                    resetPasswordSchema.save();
                                    console.log("letter");
                                    return res.json(200,{
                                        data:{
                                            message:"The password can't be spelled without letters!",
                                            error:true
                                        }
                                    })
                                    req.flash("error", "The password can't be spelled without letters!");
                                    return res.redirect('back');
                                }
                                if(!captial)
                                {
                                    console.log("cap");
                                    resetPasswordSchema.isvalid=false;
                                    resetPasswordSchema.save();
                                    return res.json(200,{
                                        data:{
                                            message:"At least one letter of your password needs respect!",
                                            error:true
                                        }
                                    })
                                    req.flash("error", "At least one letter of your password needs respect!");
                                    return res.redirect('back');
                                }
                   // console.log(user);
                                user.password=req.body.newpassword;
                                user.save();
                                resetPasswordSchema.isvalid=false;
                                resetPasswordSchema.save();
                                let userDetails={
                                    name:user.name,
                                    password:user.password,
                                    email:user.email
                                }
                                let job=queue.create("confirmpassword",userDetails).save(function(err)
                                {
                                    if(err)
                                    {
                                        console.log("error in creating a queue ",err);
                                        return;
                                    }
                                    console.log("job enqueued ",job.id);
                                });
                                return res.json(200,{
                                    data:{
                                            message:"Your new password awaits!",
                                            error:false
                                        }
                                })
                                req.flash("success","Your new password awaits!");
                                return res.redirect("/users/sign-in");
                    }
                }
                else
                {
                    resetPasswordSchema.isvalid=false;
                    resetPasswordSchema.save();
                    return res.json(200,{
                        data:{
                              message:"The two passwords are at odds!",
                                    error:true
                            }
                    })
                    req.flash("error","The two passwords are at odds!");
                    return res.redirect("/"); 
                }
                        
            }
            else
            {
                return res.json(200,{
                    data:{
                        message:"Mine, mine. This link has departed!",
                        error:true
                    }
                })
                req.flash("error","Mine, mine. This link has departed!");
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

module.exports.sendFriendshipForms=async function(req,res)
{
    try{
         FriendshipForm.create({
             isFormSent:true,
             fromUser:req.query.from,
             toUser:req.query.to
         });
         let fromUser=await User.findById(req.query.from);
         let toUser=await User.findById(req.query.to);
         let frndreq={
             sender:{
                 id:fromUser.id,
                 name:fromUser.name,
             },
             reciever:{
                 id:toUser.id,
                 name:toUser.name,
                 email:toUser.email
             }
         }
         let job=queue.create("friendrequestrecieved",frndreq).save(function(err)
         {
             if(err)
             {
                 console.log("error in creating a queue ",err);
                 return;
             }
             console.log("friend req job enqueued ",job.id);
         });
         return res.json(200,{
             data:{
                from:req.query.from,
                to:req.query.to
             },
             message:"Form put successfully!"
         })
        //  req.flash("success","Friend Request Sent Successfully!");
        //  return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in sending friendship form ",err);
        return;
    }
}

module.exports.destroyFriendshipForms=async function(req,res)
{
    try{
        console.log(req.query);
        let form=await FriendshipForm.findOneAndDelete({fromUser:req.query.from,toUser:req.query.to});
        return res.json(200,{
            data:{
               from:req.query.to,
               to:req.query.from
            },
            message:"Form removed successfully!"
        })
        req.flash("success","Friend Request Cancelled!")
        return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in sending friendship form ",err);
        return;
    }
}

module.exports.makeFriendShip=async function(req,res)
{
    try{
        let fromUser=await User.findById(req.query.from);
        let toUser=await User.findById(req.query.to);
        let newFriendshipFrom=await Friendship.create({
            fromUser:req.query.from,
            toUser:req.query.to
        });
        let newFriendshipTo=await Friendship.create({
            fromUser:req.query.to,
            toUser:req.query.from
        });
        fromUser.friendships.push(newFriendshipFrom);
        fromUser.save();
        toUser.friendships.push(newFriendshipTo);
        toUser.save();
        let imgURL;
        if(toUser.avatar)
        {
            imgURL=toUser.avatar;
        }
        else
        {
            if(toUser.gender=="male")
            {
                imgURL="https://i.stack.imgur.com/HQwHI.jpg"
            }
            else
            {
                imgURL="/images/femaleProfile.png"
            }
        }
        await FriendshipForm.findOneAndDelete({fromUser:req.query.from,toUser:req.query.to});
        return res.json(200,{
            data:{
               from:req.query.from,
               to:req.query.to,
               name:fromUser.name,
               length:fromUser.friendships.length,
               img:imgURL,
               friendName:toUser.name
               
            },
            message:"Friend request accepted successfully!"
        })
        return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in making friendship ",err);
        return;
    }
}


module.exports.destroyFriendship=async function(req,res)
{
    try
    {
        console.log(req.query);
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
        console.log(fromUser,toUser);
        existingFriendshipFrom.remove();
        existingFriendshipTo.remove();
        fromUser.friendships.pull(existingFriendshipFrom._id);
        fromUser.save();
        toUser.friendships.pull(existingFriendshipTo._id);
        toUser.save();
        let length;
        let loggedUserPage=false;
        console.log(req.params);
        if(req.params.loggedUserPage=='true')
        {
            loggedUserPage=true;
            length=fromUser.friendships.length;
        }
        else
        {
            length=toUser.friendships.length;
        }
        return res.json(200,{
            data:{
               from:req.query.from,
               to:req.query.to,
               length:length,
               loggedUserPage:loggedUserPage,
            },
            message:"Friendship removed!"
        })
        // req.flash("success","Sorry about that, Hope you guys reconcile soon!")
        return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in destroying friendship ",err);
        return;
    }
}

module.exports.confirmAccount=function(req,res)
{
    var id=req.params.id;
    console.log("confirm account");
    return res.render("confirmAccount",{
        title:"Skyinyou | Confirm Account",
        acessToken:id
    });
}

module.exports.verifyAccount=async function(req,res)
{
    try
    {
        let acessToken=req.params.id;
        let account=await newAccount.findOne({acessToken:acessToken});
        console.log(account);
        let newuser=await User.findOne({email:account.user.email});
        if(!newuser)
        {
            let job=queue.create("verifyAccount",account.user).save(function(err)
            {
                    if(err)
                    {
                        console.log("error in creating a queue ",err);
                        return;
                    }
                    console.log("job enqueued ",job.id);
            });
            
            //console.log(account.user.name);
           

            newuser=await User.create(account.user);
            newuser2=await User.findById(newuser._id);
            newuser2.info={
               about: `Hi, I am ${newuser2.name}. Nice to meet you!`
            };
            newuser2.save();
        }
        if(newuser.gender=="male")
        {
            req.flash("success","Welcome to the family, handsome!");
        }
        else if(newuser.gender=="female")
        {
            req.flash("success","Welcome to the family, beautiful!");
        }
        else
        {
            req.flash("success","Welcome to the family, stunner!")
        }
        return res.redirect("/users/sign-in");
    }
    catch(err)
    {
        console.log("error in verifying account ",err);
        return;
    }
    
}