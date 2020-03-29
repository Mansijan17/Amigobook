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

module.exports.destroy = async function(req, res){

    try{
        console.log("hello");
        let post = await Post.findById(req.params.id);
        console.log(post);
        if (post.user == req.user.id){
            post.remove();

            await Comment.deleteMany({post: req.params.id});


    
            return res.json(200, {
                message: "Post and associated comments deleted successfully!"
            });
        }else{
            return res.json(401, {
                message: "You cannot delete this post!"
            });
        }

    }catch(err){
        console.log('********', err);
        return res.json(500, {
            message: "Internal Server Error"
        });
    }
    
}