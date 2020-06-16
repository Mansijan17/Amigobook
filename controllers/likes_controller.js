const Like=require('../models/like');
const Post=require("../models/post");
const Comment=require('../models/commentSchema');
const User=require('../models/userSchema');
const commentReply=require('../models/commentReply');
const Noty=require('../models/noty');
const queue=require('../config/kue');
const likeEmailWorker=require('../worker/like_email_worker');

module.exports.toggleLike=async function(req,res)
{
    try
    {
        //  likes/toggle/?id=abc123&type=Post
        let likeable;
        let deleted=false;
        console.log("like controller ",req.query);
        if(req.query.type=="Post")
        {
            likeable=await Post.findById(req.query.id).populate("likes").populate("user","name email");
        }
        else if(req.query.type=="Comment")
        {
            likeable=await Comment.findById(req.query.id).populate("likes").populate("user","name email");
        }
        else
        {
            likeable=await commentReply.findById(req.query.id).populate("likes").populate("user","name email");
        }
        // console.log(likeable.likes);
        //check if a like already exists
        let existingLike=await Like.findOne({
            likeable:req.query.id,
            onModel:req.query.type,
            user:req.user._id
        })
        let user=await User.findById(req.user.id);
        let userName=user.name;
        let userImage=user.avatar;
        let userBgColor;
        if(!userImage)
        {
            userBgColor=user.info.bgColor
        }
        // if a like already exists
        if(existingLike)
        {
            likeID=existingLike._id;
            likeable.likes.pull(existingLike._id);
            likeable.save();
            existingLike.remove();
            deleted=true;
            if(req.query.type=="Post")
            {
                likeable.likesLength-=1;
                likeable.save();
            }
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
            if(req.query.type=="Post")
            {
                likeable.likesLength+=1;
            }
            likeable.save();
            let likeOnPostandCommentsandReplies={
                    name:likeable.user.name,
                    email:likeable.user.email,
                    content:likeable.content,
                    likedUser:user,
                    type:req.query.type
            }
            if(req.query.type=="Post")
            {
                    
                    if(likeable.sharedFromPost)
                    {
                        likeOnPostandCommentsandReplies.content=likeable.content.newContent;
                    }
            }
            if(req.query.type=="CommentReply")
            {
                    likeOnPostandCommentsandReplies.type="Reply";
                    likeOnPostandCommentsandReplies.content=likeable.content.content;
            }
            if(likeable.user.id!=user.id)
            {
                    let origianlUser=await User.findById(likeable.user._id);
                    let newNoty=await Noty.create({
                        user:req.user._id,
                        notyable:likeable,
                        onModel:req.query.type,
                        action:"liked"
                    })
                    if(!origianlUser.prevNotyOpen)
                    {
                        origianlUser.oldNotyLength=origianlUser.noties.length;
                    }
                    origianlUser.noties.push(newNoty);
                    origianlUser.save();
                    let job=queue.create("likeOnPostsandCommentsandReplies",likeOnPostandCommentsandReplies).save(function(err)
                    {
                        if(err)
                        {
                            console.log("error in creating a queue ",err);
                            return;
                        }
                        console.log("like job enqueued ",job.id);
        
                    });
                }
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
                userImage:userImage,
                userBgColor:userBgColor
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