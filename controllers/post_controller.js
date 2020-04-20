const Post=require('../models/post');
const Comment=require('../models/commentSchema');
const Like=require('../models/like');
const postsMailer=require('../mailer/post_mailer');
const queue=require('../config/kue');
const postEmailWorker=require('../worker/post_email_worker');

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
                user:req.user._id,
            });
            post=await post.populate("user","name email avatar").execPopulate();
            let job=queue.create("posts",post).save(function(err)
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
                 // if we want to populate just the name of the user 
                 //(we'll not want to send the password in the API)
                
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
        //console.log(post);
        if(post.user==req.user.id)
        {
            //change::: delete the likes of the post and associated comments
            console.log("remove post ",post);

            await Like.deleteMany({likeable:post,onModel:"Post"});
            await Like.deleteMany({_id:{$in:post.comments}});

            post.remove();
            await Comment.deleteMany({post:req.params.id});
            if(req.xhr)
            {
                console.log("post id ",req.params.id);
                return res.status(200).json({
                    data:
                    {
                        post_id:req.params.id
                    },
                    message:"Post deleted"
                });
            }
            req.flash("success","Post and associated comments deleted!");
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