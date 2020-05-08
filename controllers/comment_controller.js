const Comment=require('../models/commentSchema');
const User=require('../models/userSchema');
const Post=require('../models/post');
const Like=require('../models/like');
const commentReply=require('../models/commentReply');
const commentsMailer=require('../mailer/comments_mailer');
const queue=require('../config/kue');
const commentEmailWorker=require('../worker/comment_email_worker');



module.exports.createComment=async function(req,res)
{
    // Post.findById(req.body.post,function(err,post)
    // {
    //     if(post)
    //     {
    //         Comment.create({
    //             content:req.body.content,
    //             post:req.body.post,
    //             user:req.user._id
    //         }, function(err,newComment)
    //         {
    //             if(err)
    //             {
    //                 console.log("Error in creating the comment");
    //                 return;
    //             }
    //             post.comments.push(newComment);
    //             post.save();
    //             return res.redirect("/");
    //         });
    //     }
    // });

    try
    {
        let post=await Post.findById(req.body.post);
        if(post)
        {
            //console.log(post);
            await post.populate("user","name email").execPopulate();
            //console.log("new ",post);
            let newcomment=await Comment.create({
                            content:req.body.content,
                            post:req.body.post,
                            user:req.user._id,
                            update:false,
                            edited:false
                        });
           
          // console.log(newcomment);
            post.comments.push(newcomment);
            post.save();
            let length=post.comments.length;
            console.log("length ",length);
            //console.log(post);
            newcomment=await newcomment.populate("user","name email avatar gender").execPopulate();
            let commentOnPost={
                name:post.user.name,
                email:post.user.email,
                comment:newcomment,
                content:post.content
            }
            let nextComment={
                comment:newcomment,
                postContent:post.content
            }
            if(post.sharedFromPost)
            {
                commentOnPost.content=post.content.newContent;
                nextComment.postContent=post.content.newContent;
            }
          
           /// CommentsMailer.newComment(newcoment);
           let job=queue.create("emails",nextComment).save(function(err)
           {
               if(err)
               {
                   console.log("error in creating a queue ",err);
                   return;
               }
               console.log("comment job enqueued " ,job.id);

           });
           if(post.user.id!=newcomment.user.id)
           {
                let job2=queue.create("commentOnPosts",commentOnPost).save(function(err)
                {
                    if(err)
                    {
                        console.log("error in creating a queue ",err);
                        return;
                    }
                    console.log("post job enqueued " ,job2.id);
    
                });
           }
            if(req.xhr)
            {
               // console.log("xhr ",newcomment);
                return res.status(200).json({
                    data:
                    {
                        comment:newcomment,
                        post:post,
                        length:length
                    },
                    message:"Comment published!"
                })
            }
            req.flash("success","Comment published!");
            return res.redirect("back");
        }

    }
    catch(err)
    {
        console.log("Error: ",err);
        return;
    }
}


module.exports.destroyComment=async function(req,res)
{
    // Comment.findById(req.params.id,function(err,comment)
    // {
    //     console.log(comment);
    //     console.log(req.user);
    //     let postId=comment.post;
    //     if(comment.user==req.user.id)
    //     {
    //         comment.remove();
    //         Post.findByIdAndUpdate(postId,{
    //             $pull:{comments:req.params.id}
    //         },function(err,post)
    //         {
    //             return res.redirect("back");
    //         })
    //     }
    //     else
    //     {
    //         //deleting comments from the post if the logined user is the one who posted that post
    //         Post.findById(postId,function(err,post)
    //         {
    //             if(post.user==req.user.id)
    //             {
    //                 comment.remove();
    //                 Post.findByIdAndUpdate(postId,{
    //                         $pull:{comments:req.params.id}
    //                         },function(err,post)
    //                         {
    //                             return res.redirect("back");
    //                         })
    //             }
    //             else
    //             {
    //                 return res.redirect("back");
    //             }
    //         })
            
    //     }
    // })

    try
    {
        let comment=await Comment.findById(req.params.id);
        let postId = comment.post;
        let post=await Post.findById(postId);
        if(comment.user.id==req.user.id || post.user==req.user.id)
        {
           
            console.log("comment controller delete");
            await commentReply.deleteMany({_id:{$in:comment.replies}});
            comment.remove();
            post.comments.pull(comment);
            post.save();
            //CHANGE:: delete the likes of the comments
            await Like.deleteMany({likeable:comment._id,onModel:"Comment"});
            
            if(req.xhr)
            {
                console.log("xhr");
                return res.status(200).json({
                    data:
                    {
                        comment_id:req.params.id,
                        postID:postId
                    },
                    message:"Comment deleted"
                });
            }
            req.flash("success","Comment deleted!");
            return res.redirect("back");
            
        }
        else
        {
            req.flash("error","You are not associated to delete the comment");
            return res.redirect("back");  
        }
}
    catch(err)
    {
        console.log("Error: ",err);
        return;
    }
}
module.exports.updateComment=async function(req,res)
{
    try
    {
        let id=req.params.id;
        let comment=await Comment.findById(id);
        console.log("update controller 1");
        if(comment.user.id==req.user.id)
        {
            if(!comment.update)
            {
                
                comment.update=true;
                comment.save();
                return res.json(200,{
                    data:
                    {
                        commentID:id,
                        content:comment.content
                    },
                    message:"Form Put"
                })
            
            }
            
        }
        else
        {
            req.flash("Error","You are not authorised to update this comment!");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error in updating comment ",err);
        return;
    }
}

module.exports.updateComment2=async function(req,res)
{
    try
    {
        let id=req.body.comment;
        let comment=await Comment.findById(id);
        if(comment.user.id==req.user.id)
        {
            if(comment.content!=req.body.content)
            {
                    comment.edited=true;
                    comment.content=req.body.content;
            }
            comment.update=false;
            comment.save();
           
            return res.json(200,{
                    data:
                    {
                        commentID:id,
                        content:req.body.content,
                        edited:comment.edited
                    },
                    message:"Comment Updated Successfully"
            });
            
        }
        else
        {
            req.flash("error","You are not associated to update the comment");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}

module.exports.createReply=async function(req,res)
{
    try{
        console.log("reply controller ",req.body.comment);
        let comment=await Comment.findById(req.body.comment);
        let post=await Post.findById(comment.post);
        //console.log(comment);
        if(comment)
        {
            let newReply=await commentReply.create({
                content:req.body.content,
                comment:req.body.post,
                user:req.user._id,
                update:false,
                edited:false
            });
            let authorTag="";
            if(post.user==req.user.id)
            {
                authorTag="Author";
            }
            let user=await User.findById(req.user.id);
            let userImage=user.avatar;
            if(!userImage)
            {
                if(user.gender=="male")
                {
                    userImage="https://i.stack.imgur.com/HQwHI.jpg";
                }
                else
                {
                    userImage="/images/femaleProfile.png";
                }
            }
            comment.replies.push(newReply);
            comment.save();
            return res.status(200).json({
                data:{
                    replyUserImage:userImage,
                    replyUserName:user.name,
                    replyContent:newReply.content,
                    replyID:newReply.id,
                    commentID:req.body.comment,
                    replyUserID:user.id,
                    authorTag:authorTag
                },
                message:"Comment Reply Successfully published"
            });
        }
        return res.redirect("back");
    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}