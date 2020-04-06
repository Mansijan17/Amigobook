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
            let newcomment=await Comment.create({
                            content:req.body.content,
                            post:req.body.post,
                            user:req.user._id
                        });
           post.comments.push(newcomment);
            post.save();
            newcomment=await newcomment.populate("user","name email").execPopulate();
           /// CommentsMailer.newComment(newcoment);
           let job=queue.create("emails",newcomment).save(function(err)
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
                
                return res.status(200).json({
                    data:
                    {
                        comment:newcomment
                    },
                    message:"Comment published!"
                })
            }
            req.flash("success","Comment published!");
            return res.redirect("/");
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
        let comment=await Comment.findById(req.params.id);
        let postId = comment.post;
        if(comment.user==req.user.id)
        {
            
             comment.remove();
            Post.findByIdAndUpdate(postId,{
                            $pull:{comments:req.params.id}
                        });
            //CHANGE:: delete the likes of the comments
            await Like.deleteMany({likeable:comment._id,onModel:"Comment"});
         
            if(req.xhr)
            {
                //console.log("xhr");
                return res.status(200).json({
                    data:
                    {
                        comment_id:req.params.id
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