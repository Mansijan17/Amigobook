const Post=require('../models/post');

module.exports.createPost=function(req,res)
{
    Post.create({
        content:req.body.content,
        user:req.user._id
    },function(err,newPost)
    {
        if(err)
        {
            console.log("error in creating a post");
            return;
        }
        return res.redirect("back");
    })

}