const Comment=require('../models/commentSchema');
const Post=require('../models/post');

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
            let newcoment=await Comment.create({
                            content:req.body.content,
                            post:req.body.post,
                            user:req.user._id
                        });
            await post.comments.push(newcoment);
            await post.save();
            if(req.xhr)
            {
                newcoment=await newcoment.populate("user","name").execPopulate();
                return res.status(200).json({
                    data:
                    {
                        comment:newcoment
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

var truth=false;

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
            
            await comment.remove();
            await Post.findByIdAndUpdate(postId,{
                            $pull:{comments:req.params.id}
                        });
            truth=true;
            
        }
        else
        {
            let post=await Post.findById(postId);
            if(post.user==req.user.id)
            {
               await comment.remove();
               await Post.findByIdAndUpdate(postId,{
                            $pull:{comments:req.params.id}
                            });
                truth=true;
                       
            }
           
            else
            {
                truth=false;
                
            }
            //console.log("else end ",truth);
        
        }
        //console.log(truth);
        if(truth)
        {
            //console.log("it is true!");
            if(req.xhr)
            {
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