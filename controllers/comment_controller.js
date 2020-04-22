const Comment=require('../models/commentSchema');
const Post=require('../models/post');
const Like=require('../models/like');
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
                            user:req.user._id
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
                content:post.content,
                comment:newcomment
            }
            let nextComment={
                comment:newcomment,
                postContent:post.content
            }
           // console.log("new post ",commentOnPost);
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
        //console.log("Error: ",err);
        req.flash("error",err);
        return res.redirect("/");
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
        //console.log("comment controller delete");
        let comment=await Comment.findById(req.params.id);
        let postId = comment.post;
        //console.log(comment.post);
        if(comment.user.id==req.user.id)
        {
            //console.log("comment controller delete");
            comment.remove();
            Post.findByIdAndUpdate(postId,{
                            $pull:{comments:req.params.id}
                        });
            let post=await Post.findById(postId);
            post.comments.pull(comment);
            post.save();
            console.log(post);
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
        //console.log("Error: ",err);
        req.flash("error",err);
        return;
    }
}