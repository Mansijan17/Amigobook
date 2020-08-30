const Post=require('../models/post');
const Comment=require('../models/commentSchema');
const replyComment=require('../models/commentReply');
const Like=require('../models/like');
const User=require('../models/userSchema');
const Share=require('../models/share');
const Noty=require('../models/noty');
const postsMailer=require('../mailer/post_mailer');
const queue=require('../config/kue');
const postEmailWorker=require('../worker/post_email_worker');

module.exports.displayPost=async function(req,res)
{
    try{
        let post=await Post.findById(req.query.id).populate("user").populate({
            path:"comments",
            options:{
                sort:"-createdAt"
            },
            
            populate:
            ({
                path:"likes",
                options:{
                    sort:"-createdAt"
                },
                populate:{
                    path:"user"
                },
            }),  
        }).populate({
            path:"likes",
            options:{
                sort:"-createdAt"
            },
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
        });
        post.update=false;
        post.save();
        for(comment of post.comments)
        {
            comment.update=false;
            comment.save();
        }
        return res.render("postDisplay",{
            i:post,
            title:"Your Post | AMIGOBOOK"
        });

    }
    catch(err)
    {
        console.log("error in displaying a particular post ",err);
        return;
    }
}

module.exports.createPost= async function(req,res)
{
    try
    {
         let post =await Post.create({
                content:req.body.content,
                user:req.user._id,
                update:false,
                sharedFromPost:false,
                edited:false,
                likesLength:0
            });
            post=await post.populate("user","name email avatar info").execPopulate();
            let job=queue.create("posts",post).save(function(err)
            {
                    if(err)
                    {
                        console.log("error in creating a queue ",err);
                        return;
                    }
                    console.log("job enqueued " ,job.id);

            });
            let len=await Post.find({user:req.user._id});
            len=Object.keys(len).length;
            //console.log(typeof(len))
            if(req.xhr)
            {
                 // if we want to populate just the name of the user 
                 //(we'll not want to send the password in the API)
                
                return res.status(200).json({
                    data:
                    {
                        post:post,
                        len:len
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
    try
    {
        let post=await Post.findById(req.params.id);
        if(post.user==req.user.id)
        {
            let comments=post.comments;
            for(let comment of comments)
            {
                let replies=await replyComment.find({comment:comment});
                for(reply of replies)
                {
                    //console.log(reply.id);
                    await Like.deleteMany({likeable:reply,onModel:"CommentReply"});
                }
                await Like.deleteMany({likeable:comment,onModel:"Comment"});
                await replyComment.deleteMany({comment:comment});
            }
            await Like.deleteMany({likeable:post,onModel:"Post"});
            post.remove();
            await Comment.deleteMany({post:req.params.id});
            let shareID;
            let postsBornFromThisPost;
            if(post.sharedFromPost)
            {
               
               let share=await Share.findOne({createdPost:req.params.id});
               //console.log("share Id ",share);
               if(share!=null)
               {
                    //console.log("yes ",post.content.prevPostId);
                    shareID=share._id;
                    let originalPost=await Post.findById(post.content.prevPostId);
                    //console.log(originalPost);
                    originalPost.shares.pull(share);
                    originalPost.save();
                    share.remove();
               }
               else
               {
                   //console.log("the original post deleted");
               }
               
            }
            else
            {
                postsBornFromThisPost=await Post.find({"content.prevPostId":post.id});
                //console.log(postsBornFromThisPost);
                for(let bornpost of postsBornFromThisPost)
                {
                    await Post.findByIdAndUpdate(bornpost._id,{$set:{"content.prevPostId":null,"content.prevPostShares":null,"content.prevAuthID":null,"content.prevAuthName":null,"content.prevAuthImage":null,"content.prevAuthContent":null}});
                    await Share.deleteOne({createdPost:bornpost.id});
                }
            }
            let len=await Post.find({user:req.user._id});
            len=Object.keys(len).length;
            //console.log(req.xhr);
            if(req.xhr){
               // console.log("post id ",req.params.id,shareID,post.content.prevPostId);
                return res.json(200,{
                    data:{
                        originalPostID:post.content.prevPostId,
                        postID:req.params.id,
                        shareID:shareID,
                        bornPosts:postsBornFromThisPost,
                        len:len
                        
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
                let postLists=await Post.find({"user":req.user.id});
                //console.log("up ",postLists);
                if(req.xhr)
                {
                    return res.json(200,{
                        data:
                        {
                            postID:id,
                            content:post.content,
                            shared:post.sharedFromPost,
                            posts:postLists
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
                if(post.content!=req.body.content)
                {
                    post.edited=true;
                    post.content=req.body.content;
                }
            } 
            else
            {
                //post.content["newContent"]=req.body.content;
                if(post.content.newContent!=req.body.content)
                {
                    await Post.findByIdAndUpdate(id,{$set:{"content.newContent":req.body.content}});
                    post.edited=true;
                }
                
            }
            post.save();
            //console.log(post);
            let postLists=await Post.find({"user":req.user.id});
            //console.log("up 2",postLists);
            if(req.xhr)
            {
                return res.json(200,{
                    data:
                    {
                        postID:id,
                        content:req.body.content,
                        edited:post.edited,
                        posts:postLists
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

        // console.log("share controller called");
        // console.log(req.body);
        if(req.body.content=="")
        {
            return res.json(200,{
                error:true,
                message:"An empty content is rebellion"
            })
            req.flash("error","Empty Caption!");
            return res.redirect("back");
        }
        let post=await Post.findById(req.body.post).populate("user","name email gender avatar info").populate("shares");
        //console.log(post);
        let valid=true;
    
        if(post==null)
        {
            valid=false;
            return res.json(200,{
                message:"Request successful!",
                data:{
                   
                    valid:valid
                }
            })
        }
        else
        {
                let user=await User.findById(req.user.id);
                let userName=user.name;
                let userImage=user.avatar;
                let userBgColor;
                if(!userImage)
                {
                   userBgColor=user.info.bgColor
                }
                let originalPostAuthImage=post.user.avatar;
                let prevAuthBgColor;
                if(!originalPostAuthImage)
                {
                    prevAuthBgColor=post.user.info.bgColor;
                    
                }
                newcreatedPost=await Post.create({
                        content:{
                            prevAuthName:post.user.name,
                            prevAuthID:post.user.id,
                            prevAuthImage:originalPostAuthImage,
                            prevAuthBgColor:prevAuthBgColor,
                            prevAuthContent:post.content,
                            prevPostId:req.body.post,
                            newContent:req.body.content,
                            prevPostShares:post.shares.length+1,
                        },
                        user:req.user._id,
                        update:false,
                        sharedFromPost:true,
                        edited:false,
                        likesLength:0
                });
            newcreatedPost.populate("user").execPopulate();
            let timestamps=new Date(newcreatedPost.createdAt).toLocaleString();
            let newShare=await Share.create({
                        post:req.body.post,
                        user:req.user._id,
                        createdPost:newcreatedPost._id
            });
                shareID=newShare._id;
                post.shares.push(newShare._id);
                post.save();
                let shareOnPost={
                    name:post.user.name,
                    email:post.user.email,
                    content:post.content,
                    sharedUserName:user.name
                }
                if(post.user.id!=user.id)
                {
                    let origianlUser=await User.findById(post.user._id);
                    let newNoty=await Noty.create({
                        user:req.user._id,
                        notyable:newcreatedPost,
                        onModel:"Post",
                        action:"shared"
                    })
                    if(!origianlUser.prevNotyOpen)
                    {
                        origianlUser.oldNotyLength=origianlUser.noties.length;
                    }
                    origianlUser.noties.push(newNoty);
                    origianlUser.save();
                    let job2=queue.create("shareonposts",shareOnPost).save(function(err)
                    {
                        if(err)
                        {
                            console.log("error in creating a queue ",err);
                            return;
                        }
                        console.log("share on post job enqueued " ,job2.id);

                    });
                }
                let len=await Post.find({user:req.user._id});
                len=Object.keys(len).length;
                return res.json(200,{
                    message:"Request successful!",
                    data:{
                        newPostID:newcreatedPost._id,
                        newUserName:userName,
                        newUserID:req.user._id,
                        newUserImage:userImage,
                        newUserBgColor:userBgColor,
                        newUserContent:req.body.content,
                        newWholePost:newcreatedPost,
                        shareID:shareID,
                        originalPostID:req.body.post,
                        newPostDate:timestamps,
                        valid:valid,
                        len:len
                    },
                    error:false
                })
        }

    }
    catch(err)
    {
        console.log("error in sharing post ",err);
        return;
    }
}
