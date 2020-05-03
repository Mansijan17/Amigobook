const Post=require('../models/post');
const Comment=require('../models/commentSchema');
const Like=require('../models/like');
const User=require('../models/userSchema');
const Share=require('../models/share');
const postsMailer=require('../mailer/post_mailer');
const queue=require('../config/kue');
const postEmailWorker=require('../worker/post_email_worker');

//not necessary to create async function
//but we are creating for the sake of practice as there is
//only one call back error function
module.exports.createPost= async function(req,res)
{
    // Post.create({
    //     content:req.body.content,
    //     user:req.user._id
    // },function(err,newPost)
    // {
    //     if(err)
    //     {
    //         console.log("error in creating a post");
    //         return;
    //     }
    //     return res.redirect("back");
    // })
    try
    {
         let post =await Post.create({
                content:req.body.content,
                user:req.user._id,
                update:false,
                sharedFromPost:false
            });
            post=await post.populate("user","name email avatar").execPopulate();
            let job=queue.create("posts",post).save(function(err)
            {
                    if(err)
                    {
                        console.log("error in creating a queue ",err);
                        return;
                    }
                    console.log("job enqueued " ,job.id);

            });
            if(req.xhr)
            {
                 // if we want to populate just the name of the user 
                 //(we'll not want to send the password in the API)
                
                return res.status(200).json({
                    data:
                    {
                        post:post,
                    },
                    message:"Post created"
                })
            }
            req.flash("success","Post published!");
            return res.redirect("back");

    }
    catch(err)
    {
        //console.log("Error: ",err);
        req.flash("error",err);
        return res.redirect("back");
    }

}

module.exports.destroyPost=async function(req,res)
{
    // Post.findById(req.params.id,function(err,post)
    // {
    //     //.id means converting the object id into string
    //     if(post.user==req.user.id)
    //     {
    //         post.remove();
    //         Comment.deleteMany({post:req.params.id},function(err){
    //             return res.redirect("back");
    //         })
    //     }
    //     else
    //     {
    //         return res.redirect("back");
    //     }
    // })
    try
    {
        let post=await Post.findById(req.params.id);
        //console.log(post);
        if(post.user==req.user.id)
        {
            //change::: delete the likes of the post and associated comments
            console.log("remove post ",post);
            await Like.deleteMany({likeable:post,onModel:"Post"});
            await Like.deleteMany({_id:{$in:post.comments}});
            post.remove();
            await Comment.deleteMany({post:req.params.id});
            let shareID;
            if(post.sharedFromPost)
            {
               
               let share=await Share.findOne({createdPost:req.params.id});
               shareID=share._id;
               let originalPost=await Post.findById(post.content.prevPostId);
               originalPost.shares.pull(share);
               originalPost.save();
               share.remove();
            }
             
            if(req.xhr){
                console.log("post id ",req.params.id,shareID,post.content.prevPostId);
                return res.json(200,{
                    data:{
                        originalPostID:post.content.prevPostId,
                        postID:req.params.id,
                        shareID:shareID
                    },
                    message:"Post deleted successfully!"
                });
            
            }
            // req.flash("success","Post and associated comments deleted!");
            // return res.redirect("back");
        }
        else
        {
            req.flash("error","You are not associated to delete the post");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        //console.log("Error: ",err);
        req.flash("error",err);
        return res.redirect("back");
    }
}

module.exports.updatePost=async function(req,res)
{
    try
    {
        let id=req.params.id;
        let post=await Post.findById(id);
        if(post.user==req.user.id)
        {
            if(!post.update)
            {
                post.update=true;
                post.save();
                if(req.xhr)
                {
                    return res.json(200,{
                        data:
                        {
                            postID:id,
                            content:post.content,
                            shared:post.sharedFromPost,
                        },
                        message:"Form Put"
                    })
                }
                return res.redirect("back");
            }
            
        }
        else
        {
            req.flash("error","You are not associated to update the post");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}

module.exports.updatePost2=async function(req,res)
{
    try
    {
        let id=req.body.post;
        let post=await Post.findById(id);
        if(post.user==req.user.id)
        {
            post.update=false;
            if(!post.sharedFromPost)
            {
                post.content=req.body.content;
            }
            else
            {
                //post.content["newContent"]=req.body.content;
                await Post.findByIdAndUpdate(id,{$set:{"content.newContent":req.body.content}});
                
            }
            post.save();
            console.log(post);
            if(req.xhr)
            {
                return res.json(200,{
                    data:
                    {
                        postID:id,
                        content:req.body.content
                    },
                    message:"Post Updated Successfully"
                });
            }
            req.flash("success","Successfully updated post!");
            return res.redirect("back");
        }
        else
        {
            req.flash("error","You are not associated to update the post");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}

module.exports.sharePost=async function(req,res)
{
    try{

        console.log("share controller called");
        console.log(req.body);
        let post=await Post.findById(req.body.post).populate("user","name email gender avatar").populate("shares");
        let user=await User.findById(req.user.id);
        //let postUser=post.user;
        //console.log(post);
        let userName=user.name;
        let userImage=user.avatar;
        if(!userImage)
        {
            if(user.gender=="male")
            {
                userImage="https://i.stack.imgur.com/HQwHI.jpg";
            }
            else
            {
                userImage="/images/femaleProfile.png"
            }
        }
        let originalPostAuthImage=post.user.avatar;
        if(!originalPostAuthImage)
        {
            if(post.user.gender=="male")
            {
                originalPostAuthImage="https://i.stack.imgur.com/HQwHI.jpg";
            }
            else
            {
                originalPostAuthImage="/images/femaleProfile.png"
            }
        }
        let newcreatedPost=await Post.create({
                content:{
                    prevAuthName:post.user.name,
                    prevAuthID:post.user.id,
                    prevAuthImage:originalPostAuthImage,
                    prevAuthContent:post.content,
                    prevPostId:req.body.post,
                    newContent:req.body.content,
                    prevPostShares:post.shares.length+1,
                },
                user:req.user._id,
                update:false,
                sharedFromPost:true,
        });
       newcreatedPost.populate("user").execPopulate();
       let timestamps=new Date(newcreatedPost.createdAt).toLocaleString();
       console.log(timestamps);
        let newShare=await Share.create({
                post:req.body.post,
                user:req.user._id,
                createdPost:newcreatedPost._id
        });
        //console.log(newShare);
        shareID=newShare._id;
        post.shares.push(newShare._id);
        post.save();
        return res.json(200,{
            message:"Request successful!",
            data:{
                newPostID:newcreatedPost._id,
                newUserName:userName,
                newUserID:req.user._id,
                newUserImage:userImage,
                newUserContent:req.body.content,
                newWholePost:newcreatedPost,
                shareID:shareID,
                originalPostID:req.body.post,
                newPostDate:timestamps
            }
        })
        // req.flash("success","Post shared successfully!");
        // return res.redirect("back");
    }
    catch(err)
    {
        console.log("error in sharing post ",err);
        return;
    }
}
