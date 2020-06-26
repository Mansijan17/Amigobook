const User = require('../models/userSchema');
const Post=require('../models/post');
const fs = require('fs');
const path = require('path');
const ResetPassword=require('../models/resetPasswordSchema');
const queue=require('../config/kue');
const newpasswordEmailWorker=require('../worker/newpassword_email_worker');
const newFriendReqWorker=require('../worker/friend_request_email_worker');
const changeEmailWorker=require('../worker/change_email_worker');
const crypto=require('crypto');
const Friendship=require('../models/friendship');
const FriendshipForm=require('../models/pend_friend_forms');
const newAccount=require('../models/newAccountSchema');
const newaccountEmailWorker=require('../worker/newaccount_email_worker');
const Work=require('../models/workExp');
const Grad=require('../models/educat');

let colors=["#e558e5","#e55886","#4952be","#285874","#6d721b","#99611b","#686561","#E91E63","#C62828",
           "#F57F17","#22a1b1","#512DA8","#FB8C00","#039BE5","#00b7d5"]

//making function async
module.exports.profile = async function (req, res) {
    try
    {
        let user=await User.findById(req.params.id).populate("works").populate("grads");
        let works=user.works;
        let grads=user.grads;
        function sortLatestExp(a,b)
        {
           // console.log(a,b)
            if(a.fromYear>b.fromYear)
            {
                return -1;
            }
            else if(a.fromYear<b.fromYear)
            {
                return 1;
            }
            else{
                if(a.fromMonth>b.fromMonth)
                {
                    return -1;
                }
                else if(a.fromMonth<b.fromMonth)
                {
                    return 1;
                }
                return 0;
            }
        }
        works.sort(sortLatestExp);
        grads.sort(sortLatestExp);
        let postLists=await Post.find({user:user.id}).sort("-createdAt").populate("user").populate({
            //populating the comments of the post schema
            //Change:: populate the likes of the posts and comments
            path:"comments",
            populate:
                {
                    path:"likes",
                    populate:{
                        path:"user"
                    },
                    options:{
                        sort:"-createdAt"
                    }
                  
                },
                options:{
                    sort:"-createdAt"
                },
            
        }).populate({
            path:"likes",
            populate:{
                path:"user"
            },
            options:{
                sort:"-createdAt"
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
                //console.log(pendingFrom,pendingTo)
            }
        }   
        let birthday;
        if(user.info.personalInfo)
        {
            let date=new Date(user.info.personalInfo.bDay);
            date=date.toDateString();
            let dateArr=date.split(" ");
            birthday=dateArr[2]+" "+dateArr[1]+" ,"+dateArr[3];
        }
        return res.render('userProfile', {
            title: `${user.name} | Skyinyou`,
            profileUser: user,
            posts:postLists,
            friends:friends,
            mutualfriends:mutualfriends,
            friended:friended,
            pendingFrom:pendingFrom,
            pendingTo:pendingTo,
            works:works,
            grads:grads,
            birthday:birthday
        })

    }
    catch(err)
    {
        console.log("error in rendering profile ",err);
        return;
    }
    
}

module.exports.updateProfile = async function (req, res) {

    try{
       
    if (req.user.id == req.params.id) {
            let user = await User.findById(req.user.id);
       
            User.uploadedAvatar(req, res, function (err) {
                if (err) {
                    console.log("****Multer ", err);
                }
                //console.log("body",req.body)
                user.name = req.body.name;
                let personalInfo={
                    currentCity:req.body.currentCity,
                    homeTown:req.body.homeTown,
                    bDay:req.body.birthday
                }
                socialInfo={
                    fb:req.body.fb,
                    linkedin:req.body.linkedin,
                    quora:req.body.quora,
                    insta:req.body.insta,
                    utube:req.body.utube,
                    twitter:req.body.twitter
                }
                contactInfo={
                    phone:req.body.phone,
                    website:req.body.website
                }
                user.info={
                    about:req.body.about,
                    personalInfo:personalInfo,
                    socialInfo:socialInfo,
                    contactInfo:contactInfo,
                    bgColor:user.info.bgColor
                } 
               // console.log(user.info,user.name,user._id);
                //console.log("file ", req.file);
                if (req.file) {
                    if (user.avatar) {
                        if (fs.existsSync(path.join(__dirname, "..", user.avatar))) {
                            fs.unlinkSync(path.join(__dirname, "..", user.avatar));
                        }

                    }
                    avatar=User.avatarPath + "/" + req.file.filename;
                     user.avatar = User.avatarPath + "/" + req.file.filename;
                }
                user.save();  
            
               // console.log("updated user",user)
                Post.find({"content.prevAuthID":req.user.id},function(err,posts)
                {
                             
                    for(post of posts)
                    {
                            post.content={
                                prevAuthID:post.content.prevAuthID,
                                prevAuthName:user.name,
                                prevAuthContent:post.content.prevAuthContent,
                                prevAuthImage:user.avatar,
                                prevPostId:post.content.prevPostId,
                                prevAuthBgColor:post.content.prevAuthBgColor,
                                newContent:post.content.newContent,
                                prevPostShares:post.content.prevPostShares
                            };
                            post.save();
                            //console.log("after",post.content)
                    }  
                });
       
         
            });
      
            
           
            req.flash("success", "The avatar is sedated on new info!");
            return res.redirect("back");
        }
        else {
            req.flash("error", "Unauthorized!");
            return res.status(401).send("Unauthorised");
        }
     
    }
    catch (err) {
        req.flash("error", err);
        return res.redirect("back");
    }
  
}


module.exports.changeEmailMessage=async function(req,res)
{
    try{
        let id=req.query.id;
        let user=await User.findById(id);
        if(id==req.user.id)
        {
            let job=queue.create("changeEmail",user).save(function(err)
            {
                if(err)
                {
                    console.log("error in creating a queue ",err);
                    return;
                }
                console.log("change email 1 job enqueued ",job.id);
            });
            return res.json(200,{
                message:"Your email awaits!"
            })
        }
    }
    catch(err)
    {
        console.log("error in sending change email message ",err);
        return;
    }
}

module.exports.changeEmailPage=async function(req,res)
{
    try{
        if(req.isAuthenticated())
        {
            let id=req.query.id;
            if(id==req.user.id)
            {
               let user=await User.findById(id);
               return res.render("forgetPassword",{
                   title:"Skyinyou | Change Email",
                   user:user
               });
            }
        }
        return res.redirect("/");
    
    }
    catch(err)
    {
        console.log("error in rendering email page");
    }
}

module.exports.changeEmailConfirm=async function(req,res)
{
    try{
        if(req.isAuthenticated())
        {
            let id=req.params.id;
            let user=await User.findById(id);
            if(user.email==req.body.email)
            {
                req.flash("error","Are you getting back with ex?");
                return res.redirect("back");
            }
            let emailUser=await User.findOne({"email":req.body.email});
            if(emailUser)
            {
                req.flash("error","This email is already in skies!");
                return res.redirect("back");
            }
            if(id==req.user.id)
            {
               let user1={
                   oldEmail:user.email,
               }
               user.email=req.body.email;
               user.save();
               user1.user=user;
               //console.log(user1);
               let job=queue.create("changeEmailConfirm",user1).save(function(err)
               {
                   if(err)
                   {
                       console.log("error in creating a queue ",err);
                       return;
                   }
                   console.log("change email 1 job enqueued ",job.id);
               });
               
               req.flash("success","Your new email is live!");
            } 
        }        
        return res.redirect("/");
    }
    catch(err)
    {
        console.log("error in rendering email page");
    }
}

module.exports.removeDP=async function(req,res)
{
    try{
        let id=req.query.id
        if(req.user.id==id)
        {
            let user=await User.findById(id);
            fs.unlinkSync(path.join(__dirname, "..", user.avatar));
            user.avatar="";
            user.save();
            let posts=await Post.find({"content.prevAuthID":req.user.id});
            for(post of posts)
            {
                post.content={
                    prevAuthID:post.content.prevAuthID,
                    prevAuthName:user.name,
                    prevAuthContent:post.content.prevAuthContent,
                    prevAuthImage:user.avatar,
                    prevPostId:post.content.prevPostId,
                    prevAuthBgColor:post.content.prevAuthBgColor,
                    newContent:post.content.newContent,
                    prevPostShares:post.content.prevPostShares
            };
            post.save();
            //console.log("after",post.content)
            }  
            req.flash("success","The DP has just collapsed!");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error in removing dp",err);
        return;
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
                //console.log("len");
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
               // console.log("sp");
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
                //console.log("no");
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
                //console.log("letter");
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
               // console.log("cap");
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
            //console.log(name2);
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
               // console.log("new account schema",newuser);
                let randomBgColor=colors[Math.floor(Math.random()*colors.length)];
                //console.log("new color",randomBgColor);
                newuser.user.info={about:`Hi, I am ${req.body.name}. Nice to meet you!`,
                bgColor:randomBgColor,personalInfo:{},socialInfo:{},contactInfo:{}}
                newuser.user.prevNotyOpen=false;
                newuser.user.oldNotyLength=0;
                newuser.user.prevPendFROpen=false;
                newuser.user.oldPendFRLength=0;
               // console.log(newuser);
                let necoount=await newAccount.create(newuser);
                //console.log(necoount)
            }
            else
            {
                
                newAccountSchema.acessToken=newuser.acessToken;
                let info=newAccountSchema.user.info;
                info.about=`Hi, I am ${req.body.name}. Nice to meet you!`;
                newAccountSchema.user=req.body;
                newAccountSchema.user.info=info;
                newAccountSchema.user.oldNotyLength=0;
                newAccountSchema.user.prevNotyOpen=false;
                newAccountSchema.user.prevPendFROpen=false;
                newAccountSchema.user.oldPendFRLength=0;
                newAccountSchema.save();
               // console.log("exists ",newAccountSchema.user,info)
            }
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
                    message:"Your email chariot awaits!",
                    error:false
                }
            })
            req.flash("success", "Your @ chariot awaits!");
            return res.redirect('/');
        }
        else {
            return res.json(200,{
                data:{
                    message:"This email is already among the skies!",
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
    if(req.isAuthenticated())
    {
        return res.redirect("back");
    }
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
                    message:"This email is still on earth!",
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
           // console.log(resetPasswordSchema);
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
                    message:"Your email has a new tweet!",
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
                                    //console.log("len");
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
                                   // console.log("sp");
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
                                   // console.log("no");
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
                                    //console.log("letter");
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
                                   // console.log("cap");
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
        if(req.user.id!=req.query.to)
        {
            let form=await FriendshipForm.create({
                isFormSent:true,
                fromUser:req.user._id,
                toUser:req.query.to
            });
            let fromUser=await User.findById(req.user._id);
            let toUser=await User.findById(req.query.to);
            if(!toUser.prevPendFROpen)
            {
                toUser.oldPendFRLength=toUser.pendFR.length;
            }
            toUser.pendFR.push(form);
            toUser.save();
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
                   from:req.user._id,
                   to:req.query.to
                },
                message:"Form put successfully!"
            })
        }
        //  req.flash("success","Friend Request Sent Successfully!");
        //  return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in sending friendship form ",err);
        return;
    }
}

module.exports.destroyFriendshipFormsFrom=async function(req,res)
{
    try{
        //console.log(req.query);
         await FriendshipForm.findOneAndDelete({fromUser:req.user._id,toUser:req.query.to});
         return res.json(200,{
            data:{
               from:req.user._id,
               to:req.query.to,
            },
            message:"Form removed successfully!",
            error:false
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

module.exports.destroyFriendshipFormsTo=async function(req,res)
{
    try{
        //console.log(req.query);
        let form=await FriendshipForm.findOneAndDelete({fromUser:req.query.from,toUser:req.user._id});
        //console.log("form ",form)
        let toUser=await User.findById(req.user._id);
        if(!form)
        {
           // console.log("form nhi hai");
            return res.json({
                message:"Uh-Oh, The request is taken back!",
                error:true
            })
            req.flash("error","Uh-Oh, The request is taken back!");
            return res.redirect("/")
        }
        toUser.oldPendFRLength-=1;
        toUser.pendFR.pull(form._id);
        toUser.save();
        if(toUser.pendFR.length==0)
        {
            toUser.oldPendFRLength=0;
            toUser.prevPendFROpen=false;
        }
       // console.log(toUser)
        return res.json(200,{
            data:{
               from:req.query.from,
               to:req.user._id,
               user:toUser,
               frID:form._id
            },
            message:"Form removed successfully!",
            error:false
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
        console.log(req.query);
        let form=await FriendshipForm.findOneAndDelete({fromUser:req.query.from,toUser:req.user._id});
        if(!form)
        {
            //console.log("form nhi hai");
            return res.json({
                message:"Uh-Oh, The request is taken back!",
                error:true
            })
            req.flash("error","Uh-Oh, The request is taken back!");
            return res.redirect("/")
        }
        let toUser=await User.findById(req.user._id);
        let fromUser=await User.findById(req.query.from);
        let newFriendshipFrom=await Friendship.create({
            fromUser:req.query.from,
            toUser:req.user._id
        });
        let newFriendshipTo=await Friendship.create({
            fromUser:req.user._id,
            toUser:req.query.req.query.from
        });
        fromUser.friendships.push(newFriendshipFrom);
        fromUser.save();
        toUser.friendships.push(newFriendshipTo);
        let imgURL;
        let bgColor;
        if(toUser.avatar)
        {
            imgURL=toUser.avatar;
        }
        else
        {
            bgColor=toUser.info.bgColor;
        }
        toUser.oldPendFRLength-=1;
        toUser.pendFR.pull(form._id);
        toUser.save();
        if(toUser.pendFR.length==0)
        {
            toUser.oldPendFRLength=0;
            toUser.prevPendFROpen=false;
        }
        let frndreq={
            sender:{
                email:fromUser.email,
                name:fromUser.name
            },
            reciever:{
                name:toUser.name
            }
        }
        let job=queue.create("friendrequestaccepted",frndreq).save(function(err)
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
               from:fromUser._id,
               to:toUser._id,
               name:fromUser.name,
               length:fromUser.friendships.length,
               img:imgURL,
               bgColor:bgColor,
               friendName:toUser.name,
               user:toUser,
               frID:form._id
               
            },
            message:"Friend request accepted successfully!",
            error:false
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
        //console.log(req.query);
        let existingFriendshipFrom=await Friendship.findOne({
            fromUser:req.user._id,
            toUser:req.query.to
        });
        let existingFriendshipTo=await Friendship.findOne({
            fromUser:req.query.to,
            toUser:req.user._id
        });
        let fromUser=await User.findById(req.user._id);
        let toUser=await User.findById(req.query.to);
        //console.log(fromUser,toUser);
        existingFriendshipFrom.remove();
        existingFriendshipTo.remove();
        fromUser.friendships.pull(existingFriendshipFrom._id);
        fromUser.save();
        toUser.friendships.pull(existingFriendshipTo._id);
        toUser.save();
        let length;
        let loggedUserPage=false;
        //console.log(req.params);
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
               from:req.user._id,
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
    //console.log("confirm account");
    return res.render("confirmAccount",{
        title:"Skyinyou | Confirm Account",
        acessToken:id
    });
}

module.exports.verifyAccount=async function(req,res)
{
    try
    {
        if(req.isAuthenticated())
        {
            return res.redirect("/");
        }
        let acessToken=req.params.id;
        let account=await newAccount.findOne({acessToken:acessToken});
        let newuser=await User.findOne({email:account.user.email});
        if(!newuser)
        {
            account.user.notGoogle=true;
           // console.log(account.user);
            let job=queue.create("verifyAccount",account.user).save(function(err)
            {
                    if(err)
                    {
                        console.log("error in creating a queue ",err);
                        return;
                    }
                    console.log("job enqueued ",job.id);
            });
            
            newuser=await User.create(account.user);
            newuser2=await User.findById(newuser._id);
            newuser2.info=newuser.info;
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

module.exports.addWorkGrad=async function(req,res)
{
    try{
        let date=new Date()
        let year=date.getFullYear();
        let month=date.getMonth()
        if(req.user.id)
        {
            if(req.body.check!="on")
            {   //console.log("not check")
                if(req.body.toYear.length!=4 || req.body.fromYear.length!=4 || req.body.toMonth.length!=2 || req.body.fromMonth.length!=2)
                {
                    return res.json(200,{
                        message:"Year or maybe month's length is quarrelsome!",
                        error:true,
                    })
                    req.flash("error","Year or maybe month's length is quarrelsome!");
                    return res.redirect("back");
                }
                let fromYear=parseInt(req.body.fromYear);
                let toYear=parseInt(req.body.toYear);
                let fromMonth=parseInt(req.body.fromMonth);
                let toMonth=parseInt(req.body.toMonth);
                if(fromYear>year || toYear>year || fromYear<1940 || toYear<1940 || fromMonth<0 || fromMonth>12 || toMonth<0 || fromYear>toYear)
                {
                    //console.log("1")
                    return res.json(200,{
                        message:"Wow, your exp must be out of this world!",
                        error:true,
                    })
                    req.flash("error","Wow, your exp must be out of this world!");
                    return res.redirect("back");
                }
                if(toYear==year)
                {
                    if(toMonth>month)
                    {
                        return res.json(200,{
                            message:"Wow, your exp must be out of this world!",
                            error:true,
                        })
                    }
                }
                if(fromYear==toYear)
                {
                    if(fromMonth>toMonth)
                    {
                        //console.log("f>tm")
                        return res.json(200,{
                            message:"Wow, your exp must be out of this world!",
                            error:true,
                        })
                        req.flash("error","Wow, your exp must be out of this world!");
                        return res.redirect("back");
                    }
                }
            }
            else
            {
                if(req.body.fromYear.length!=4 || req.body.fromMonth.length!=2)
                {
                    return res.json(200,{
                        message:"Year or maybe month's length is quarrelsome!",
                        error:true,
                    })
                    req.flash("error","Year or maybe month's length is quarrelsome!");
                    return res.redirect("back");
                }
                let fromYear=parseInt(req.body.fromYear);
                let fromMonth=parseInt(req.body.fromMonth);

                if(fromYear>year || fromYear<1940 || fromMonth<0 || fromMonth>12)
                {
                    return res.json(200,{
                        message:"Wow, your exp must be out of this world!",
                        error:true,
                    })
                    req.flash("error","Wow, your exp must be out of this world!");
                    return res.redirect("back");
                }
                if(fromYear==year)
                {
                    if(fromMonth>month)
                    {
                        return res.json(200,{
                            message:"Wow, your exp must be out of this world!",
                            error:true,
                        })   
                    }
                }
            }
           
            let user=await User.findById(req.user.id);
            req.body.user=req.user.id;
            let newAddition;
            let length;
            if(req.body.type=="work")
            {
                newAddition=await Work.create({
                    title:req.body.title,
                    company:req.body.company,
                    descrpt:req.body.descrpt,
                    fromMonth:req.body.fromMonth,
                    fromYear:req.body.fromYear,
                    check:req.body.check,
                    toMonth:req.body.toMonth,
                    toYear:req.body.toYear,
                    user:req.user.id
                });
                user.works.push(newAddition);
                length=user.works.length;
            }
            else
            {
                newAddition=await Grad.create({
                    grade:req.body.title,
                    school:req.body.company,
                    descrpt:req.body.descrpt,
                    fromMonth:req.body.fromMonth,
                    fromYear:req.body.fromYear,
                    check:req.body.check,
                    toMonth:req.body.toMonth,
                    toYear:req.body.toYear,
                    user:req.user.id
                });
                user.grads.push(newAddition);
                length=user.grads.length;
            }
            
            user.save()
            
            return res.json(200,{
                data:{
                    object:newAddition,
                    length:length,
                    type:req.body.type
                },
                error:false
            })
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("Error in adding work",err);
    }
}

module.exports.updateWorkGradModal=async function(req,res)
{
    try{
        let id=req.query.id;
        //console.log("update modal calling controoleer ",req.query)
        let updatedObj;
        if(req.query.type=="work")
        {
            updatedObj=await Work.findById(id);
        }
        else
        {
            updatedObj=await Grad.findById(id);
        }
        //console.log("updatedObj ",updatedObj)
        if(updatedObj.user==req.user.id)
        {
            return res.json(200,{
                data:{
                    updatedObj:updatedObj,
                    type:req.query.type
                }
            })
        }
        return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in calling update work/grad modal ",err);
        return;
    }
}

module.exports.updateWorkGrad=async function(req,res)
{
    try{
        let id=req.body.id;
        let object;
        if(req.body.type=="work")
        {
            object=await Work.findById(id);
        }
        else
        {
            object=await Grad.findById(id);
        }
        //console.log("object found",object);
        let date=new Date();
        let year=date.getFullYear();
        let month=date.getMonth();
        if(object.user==req.user.id)
        {
            if(req.body.check!="on")
            {   //console.log("not check")
                if(req.body.toYear.length!=4 || req.body.fromYear.length!=4 || req.body.toMonth.length!=2 || req.body.fromMonth.length!=2)
                {
                    return res.json(200,{
                        message:"Year or maybe month's length is quarrelsome!",
                        error:true,
                    })
                    req.flash("error","Year or maybe month's length is quarrelsome!");
                    return res.redirect("back");
                }
                let fromYear=parseInt(req.body.fromYear);
                let toYear=parseInt(req.body.toYear);
                let fromMonth=parseInt(req.body.fromMonth);
                let toMonth=parseInt(req.body.toMonth);
                if(fromYear>year || toYear>year || fromYear<1940 || toYear<1940 || fromMonth<0 || fromMonth>12 || toMonth<0 || fromYear>toYear)
                {
                    return res.json(200,{
                        message:"Wow, your exp must be out of this world!",
                        error:true,
                    })
                    req.flash("error","Wow, your exp must be out of this world!");
                    return res.redirect("back");
                }
                if(toYear==year)
                {
                    if(toMonth>month)
                    {
                        return res.json(200,{
                            message:"Wow, your exp must be out of this world!",
                            error:true,
                        })
                    }
                }
                if(fromYear==toYear)
                {
                    if(fromMonth>toMonth)
                    {
                        //console.log("f>tm")
                        return res.json(200,{
                            message:"Wow, your exp must be out of this world!",
                            error:true,
                        })
                        req.flash("error","Wow, your exp must be out of this world!");
                        return res.redirect("back");
                    }
                }
                if(object.check=="on")
                {
                   object.check="";
                }
                object.toMonth=req.body.toMonth;
                object.toYear=req.body.toYear;
            }
            else
            {
                //console.log("check")
                if(req.body.fromYear.length!=4 || req.body.fromMonth.length!=2)
                {
                    return res.json(200,{
                        message:"Year or maybe month's length is quarrelsome!",
                        error:true,
                    })
                    req.flash("error","Year or maybe month's length is quarrelsome!");
                    return res.redirect("back");
                }
                let fromYear=parseInt(req.body.fromYear);
                let fromMonth=parseInt(req.body.fromMonth);

                if(fromYear>year || fromYear<1940 || fromMonth<0 || fromMonth>12)
                {
                    return res.json(200,{
                        message:"Wow, your exp must be out of this world!",
                        error:true,
                    })
                    req.flash("error","Wow, your exp must be out of this world!");
                    return res.redirect("back");
                }
                if(fromYear==year)
                {
                    if(fromMonth>month)
                    {
                        return res.json(200,{
                            message:"Wow, your exp must be out of this world!",
                            error:true,
                        }) 
                        req.flash("error","Wow, your exp must be out of this world!");
                        return res.redirect("back");  
                    }
                }
                if(object.check=="")
                {
                    object.check="on"
                }
                object.toMonth="",
                object.toYear="";
            }
            object.fromMonth=req.body.fromMonth;
            object.fromYear=req.body.fromYear;
            if(req.body.name=="work")
            {
                object.title=req.body.title;
                object.company=req.body.company;
            }
            else
            {
                object.grade=req.body.title;
                object.school=req.body.company;
            }
            object.descrpt=req.body.descrpt;
            //console.log("update",object);
            object.save();   
            return res.json(200,{
                data:{
                    object:object,
                    type:req.body.type
                },
                error:false
            })
        }
        return res.redirect("back")
    }
    catch(err)
    {
        console.log("error in updating work ",err);
        return;
    }
}

module.exports.deleteWorkGradModal=async function(req,res)
{
    try{
        let id=req.query.id;
        let deleteItem;
        if(req.query.type=="work")
        {
            deleteItem=await Work.findById(id);
        }
        else
        {
            deleteItem=await Grad.findById(id)
        }
        if(deleteItem.user==req.user.id)
        {
            return res.json(200,{
                data:{
                    item:deleteItem,
                    type:req.query.type
                }
            })
        }
        return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in calling update work modal ",err);
        return;
    }
}

module.exports.deleteWorkGrad=async function(req,res)
{
    try{
        let id=req.query.id;
        let obj;
        if(req.query.type=="work")
        {
            obj=await Work.findById(id);
        }
        else
        {
            obj=await Grad.findById(id);
        }
        if(obj.user==req.user.id)
        {
            let user=await User.findById(req.user.id);
            let length;
            if(req.query.type=="work")
            {
                user.works.pull(obj._id);
                length=user.works.length;
            }
            else
            {
                user.grads.pull(obj._id);
                length=user.grads.length;
            }
            user.save();
            obj.remove();
            return res.json(200,{
                data:{
                    obj:obj,
                    length:length,
                    type:req.query.type
                }
            })
        }
        return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in deleting work ",err);
        return;
    }
}


