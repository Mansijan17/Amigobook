const Comment=require('../models/commentSchema');
const Post=require('../models/post');

module.exports.createComment=function(req,res)
{
    Post.findById(req.body.post,function(err,post)
    {
        if(post)
        {
            Comment.create({
                content:req.body.content,
                post:req.body.post,
                user:req.user._id
            }, function(err,newComment)
            {
                if(err)
                {
                    console.log("Error in creating the comment");
                    return;
                }
                post.comments.push(newComment);
                post.save();
                return res.redirect("/");
            });
        }
    });
}

module.exports.destroyComment=function(req,res)
{
    Comment.findById(req.params.id,function(err,comment)
    {
        console.log(comment);
        console.log(req.user);
        let postId=comment.post;
        if(comment.user==req.user.id)
        {
            comment.remove();
            Post.findByIdAndUpdate(postId,{
                $pull:{comments:req.params.id}
            },function(err,post)
            {
                return res.redirect("back");
            })
        }
        else
        {
            //deleting comments from the post if the logined user is the one who posted that post
            Post.findById(postId,function(err,post)
            {
                if(post.user==req.user.id)
                {
                    comment.remove();
                    Post.findByIdAndUpdate(postId,{
                            $pull:{comments:req.params.id}
                            },function(err,post)
                            {
                                return res.redirect("back");
                            })
                }
                else
                {
                    return res.redirect("back");
                }
            })
            
        }
    })
}