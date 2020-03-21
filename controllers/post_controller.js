const Post=require('../models/post');
const Comment=require('../models/commentSchema');

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
                user:req.user._id
            });

            if(req.xhr)
            {
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
        if(post.user==req.user.id)
        {
            await post.remove();
            await Comment.deleteMany({post:req.params.id});
            req.flash("success","Post and comments deleted!");
            return res.redirect("back");
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