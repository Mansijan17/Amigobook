const User = require('../models/userSchema');
const fs = require('fs');
const path = require('path');

//making function async
module.exports.profile = async function (req, res) {
    console.log(req.params.id);
    User.findById(req.params.id, function (err, user) {
        return res.render('userProfile', {
            title: 'User Profile',
            profileUser: user
        })
    })

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
        return res.redirect("/");
    }
    return res.render('userSignUp', {
        title: "Codeial | Sign Up"
    })
}


// render the sign in page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return res.render('userSignIn', {
        title: "Codeial | Sign In"
    })
}

// get the sign up data
module.exports.create = async function (req, res) {
    if (req.body.password != req.body.confirm_password) {
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
            await User.create(req.body);
            return res.redirect('/users/sign-in');
        }
        else {
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