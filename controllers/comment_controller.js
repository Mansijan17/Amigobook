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