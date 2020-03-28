const Post=require('../../../models/post');
const Comment=require('../../../models/commentSchema');

module.exports.index= async function(req,res)
{
    let postLists=await Post.find({}).sort("-createdAt").populate("user").populate({
        //populating the comments of the post schema
        path:"comments",
        populate:
        {
            //populating users of the comment from the comment schema
            path:"user",
        }
    });

    return res.json(200,{
        message:"Lists of posts",
        posts:postLists
    })
}

module.exports.destroyPost=async function(req,res)
{
   
    try
    {
        let post=await Post.findById(req.params.id);
        // if(post.user==req.user.id)
        // {
            await post.remove();
            await Comment.deleteMany({post:req.params.id});
            
            //req.flash("success","Post and comments deleted!");
            //return res.redirect("back");

            return res.json(200,{
                message:"Posts and associated comments deleted successfully!"
            });
        // }
        // else
        // {
        //     req.flash("error","You are not associated to delete the post");
        //     return res.redirect("back");
        // }
    }
    catch(err)
    {
        console.log("*******",err);
        //req.flash("error",err);
        //return res.redirect("back");
        return res.json(500,{
            message:"Internal Server Error"
        });
    }
}