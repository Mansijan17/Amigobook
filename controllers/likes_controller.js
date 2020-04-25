const Like=require('../models/like');
const Post=require("../models/post");
const Comment=require('../models/commentSchema');
const User=require('../models/userSchema');
const queue=require('../config/kue');
const likeEmailWorker=require('../worker/like_email_worker');

module.exports.toggleLike=async function(req,res)
{
    try
    {
        //  likes/toggle/?id=abc123&type=Post
        let likeable;
        let deleted=false;
        if(req.query.type=="Post")
        {
            likeable=await Post.findById(req.query.id).populate("likes").populate("user","name email");
        }
        else
        {
            likeable=await Comment.findById(req.query.id).populate("likes").populate("user","name email");
        }
        //console.log(likeable);
        //check if a like already exists
        let existingLike=await Like.findOne({
            likeable:req.query.id,
            onModel:req.query.type,
            user:req.user._id
        })
        let user=await User.findById(req.user.id);
        let userName=user.name;
        let userImage=user.avatar;
        if(!userImage)
        {
            if(user.gender=="male")
            {
                userImage="https://i.stack.imgur.com/HQwHI.jpg";
            }
            else
            {
                userImage="/images/femaleProfile.png"
            }
        }
        
        //console.log("liking user name ",userName);
        // if a like already exists
        if(existingLike)
        {
            likeID=existingLike._id;
            likeable.likes.pull(existingLike._id);
            likeable.save();
            existingLike.remove();
            deleted=true;
        }
        else
        {
            //make a new like
            let newLike=await Like.create({
                likeable:req.query.id,
                onModel:req.query.type,
                user:req.user._id
            });
            likeID=newLike._id;
            likeable.likes.push(newLike._id);
            likeable.save();
            //if(req.query.type=="Post")
            //{
                let likeOnPostandComments={
                    name:likeable.user.name,
                    email:likeable.user.email,
                    content:likeable.content,
                    likedUser:user,
                    type:req.query.type
                }
                if(likeable.user.id!=user.id)
                {
                    let job=queue.create("likeOnPostsandComments",likeOnPostandComments).save(function(err)
                    {
                        if(err)
                        {
                            console.log("error in creating a queue ",err);
                            return;
                        }
                        console.log("post job enqueued " ,job.id);
        
                    });
                }
           // }
        }
        return res.json(200,{
            message:"Request successful!",
            data:{
                deleted:deleted,
                name:userName,
                type:req.query.type,
                id:req.query.id,
                likeID:likeID,
                userID:req.user._id,
                userImage:userImage
            }
        })
    }
    catch(err)
    {
        console.log(err);
       // req.flash("error ",err);
        return res.json(500,{
            message:"Interval Server Error"
        });
    }
}