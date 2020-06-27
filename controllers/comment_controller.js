const Comment=require('../models/commentSchema');
const User=require('../models/userSchema');
const Post=require('../models/post');
const Like=require('../models/like');
const commentReply=require('../models/commentReply');
const Noty=require('../models/noty');
const commentsMailer=require('../mailer/comments_mailer');
const queue=require('../config/kue');
const commentEmailWorker=require('../worker/comment_email_worker');


module.exports.createComment=async function(req,res)
{
    try
    {
        let post=await Post.findById(req.body.post);
        if(post)
        {
            await post.populate("user","name email").execPopulate();
            let newcomment=await Comment.create({
                            content:req.body.content,
                            post:req.body.post,
                            user:req.user._id,
                            update:false,
                            edited:false
                        });
           
            post.comments.push(newcomment);
            post.save();
         
            let length=post.comments.length;
            //console.log("length ",length);
            //console.log(post);
            newcomment=await newcomment.populate("user","name email avatar gender info").execPopulate();
            let commentOnPost={
                name:post.user.name,
                email:post.user.email,
                comment:newcomment,
                content:post.content
            }
            let nextComment={
                thought:newcomment,
                parentContent:post.content,
                type:"comment",
                parentType:"post"
            }
            if(post.sharedFromPost)
            {
                commentOnPost.content=post.content.newContent;
                nextComment.parentContent=post.content.newContent;
            }
          
           let job=queue.create("emails",nextComment).save(function(err)
           {
               if(err)
               {
                   console.log("error in creating a queue ",err);
                   return;
               }
               console.log("comment job enqueued " ,job.id);

           });
           let origianlUser=await User.findById(post.user._id).populate({
               path:"noties"
           });
           if(post.user.id!=newcomment.user.id)
           {
                let newNoty=await Noty.create({
                    user:req.user._id,
                    notyable:post,
                    onModel:"Post",
                    action:"commented"
                })
                if(!origianlUser.prevNotyOpen)
                {
                    origianlUser.oldNotyLength=origianlUser.noties.length;
                }
                origianlUser.noties.push(newNoty);
                origianlUser.save();
                let job2=queue.create("commentOnPosts",commentOnPost).save(function(err)
                {
                    if(err)
                    {
                        console.log("error in creating a queue ",err);
                        return;
                    }
                    console.log("post job enqueued " ,job2.id);
    
                });
           }
            if(req.xhr)
            {
                return res.status(200).json({
                    data:
                    {
                        comment:newcomment,
                        post:post,
                        length:length,
                        notyOriginalUser:origianlUser
                    },
                    message:"Comment published!"
                })
            }
            req.flash("success","Comment published!");
            return res.redirect("back");
        }

    }
    catch(err)
    {
        console.log("Error: ",err);
        return;
    }
}


module.exports.destroyComment=async function(req,res)
{
    try
    {
        let comment=await Comment.findById(req.params.id);
        let postId = comment.post;
        let post=await Post.findById(postId);
        if(comment.user.id==req.user.id || post.user==req.user.id)
        {
           
            let replies=comment.replies;
            //console.log(replies);
            for(let reply of replies)
            {
               // console.log(reply);
                await Like.deleteMany({likeable:reply,onModel:"CommentReply"});
            }
            await commentReply.deleteMany({_id:{$in:comment.replies}});
            comment.remove();
            post.comments.pull(comment);
            post.save();
            //CHANGE:: delete the likes of the comments
            await Like.deleteMany({likeable:comment._id,onModel:"Comment"});
            
            if(req.xhr)
            {
               // console.log("xhr");
                return res.status(200).json({
                    data:
                    {
                        comment_id:req.params.id,
                        postID:postId
                    },
                    message:"Comment deleted"
                });
            }
            req.flash("success","See you, till the next time!");
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
        console.log("Error: ",err);
        return;
    }
}
module.exports.updateComment=async function(req,res)
{
    try
    {
        let id=req.params.id;
        let comment=await Comment.findById(id);
        if(comment.user.id==req.user.id)
        {
            if(!comment.update)
            {
                
                comment.update=true;
                comment.save();
                return res.json(200,{
                    data:
                    {
                        commentID:id,
                        content:comment.content
                    },
                    message:"Form Put"
                })
            
            }
            
        }
        else
        {
            req.flash("Error","You are not authorised to update this comment!");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error in updating comment ",err);
        return;
    }
}

module.exports.updateComment2=async function(req,res)
{
    try
    {
        let id=req.body.comment;
        let comment=await Comment.findById(id);
        if(comment.user.id==req.user.id)
        {
            if(comment.content!=req.body.content)
            {
                    comment.edited=true;
                    comment.content=req.body.content;
            }
            comment.update=false;
            comment.save();
           
            return res.json(200,{
                    data:
                    {
                        commentID:id,
                        content:req.body.content,
                        edited:comment.edited,
                        postID:comment.post
                    },
                    message:"Comment Updated Successfully"
            });
            
        }
        else
        {
            req.flash("error","You are not associated to update the comment");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}

module.exports.showReply=async function(req,res)
{
    try{

        let id=req.params.id;
        let comment=await Comment.findById(id).populate({
            path:"replies likes",
            options:{
                sort:"-createdAt"
            },
            populate:{
                path:"user likes",
                populate:{
                    path:"user"
                },
                options:{
                    sort:"-createdAt"
                },
            }
        }).populate("user");
        let replies=comment.replies;
        for(reply of replies)
        {
            reply.liked=false;
            for(like of reply.likes)
            {
                if(like.user.id==req.user.id)
                {
                    reply.liked=true;
                }
            }
            reply.update=false;
            reply.save();
        }
        comment.update=false;
        comment.save();
        let post=await Post.findById(comment.post);
        post.populate("user");
        return res.render("replyCommentContent",{
            title:"Skyinyou | Comment Replies",
            comment:comment,
            i:post,
        });

    }
    catch(err)
    {
        console.log("error in showing replies ",err);
        return;
    }
}

module.exports.createReply=async function(req,res)
{
    try{
        let comment=await Comment.findById(req.body.comment);
        let post=await Post.findById(comment.post);
        if(comment)
        {
            let newReply=await commentReply.create({
                content:req.body.content,
                comment:req.body.comment,
                user:req.user._id,
                update:false,
                edited:false,
                isReply:false
            });
            let authorTag="";
            if(post.user==req.user.id)
            {
                authorTag="Author";
            }
            let user=await User.findById(req.user.id);
            let userImage=user.avatar;
            let userBgColor;
            if(!userImage)
            {
                userBgColor=user.info.bgColor;
            }
            comment.replies.push(newReply);
            comment.save();
            if(comment.user.id!=req.user.id)
            {
                let origianlUser=await User.findById(comment.user._id);
                let newNoty=await Noty.create({
                    user:req.user._id,
                    notyable:comment,
                    onModel:"Comment",
                    action:"replied"
                })
                if(!origianlUser.prevNotyOpen)
                {
                    origianlUser.oldNotyLength=origianlUser.noties.length;
                }
                origianlUser.noties.push(newNoty);
                origianlUser.save();
                let nextReply={
                    thought:newReply,
                    parentContent:comment.content,
                    type:"reply",
                    parentType:"comment"
                }
                let replyOnComment={
                    reply:newReply,
                    user:newReply.user,
                    email:comment.user.email,
                    content:comment.content
                }
               
               let job=queue.create("emails",nextReply).save(function(err)
               {
                   if(err)
                   {
                       console.log("error in creating a queue ",err);
                       return;
                   }
                   console.log("reply job enqueued " ,job.id);
    
               });
               let job2=queue.create("replyOnComments",replyOnComment).save(function(err)
               {
                   if(err)
                   {
                       console.log("error in creating a queue ",err);
                       return;
                   }
                   console.log("reply job 2 enqueued " ,job2.id);
    
               });
            }

            return res.status(200).json({
                data:{
                    replyUserImage:userImage,
                    replyUserBgColor:userBgColor,
                    replyUserName:user.name,
                    replyContent:newReply.content,
                    replyID:newReply.id,
                    commentID:req.body.comment,
                    replyUserID:user.id,
                    authorTag:authorTag
                },
                message:"Comment Reply Successfully published"
            });
        }
    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}

module.exports.deleteReply=async function(req,res)
{
    try{
        let id=req.params.id;
        let reply=await commentReply.findById(id);
        let comment=await Comment.findById(reply.comment);
        let post=await Post.findById(comment.post);
        if(req.user.id==comment.user.id || req.user.id==reply.user.id || req.user.id==post.user)
        {
            await Like.deleteMany({likeable:reply._id,onModel:"CommentReply"});
            comment.replies.pull(reply);
            comment.save();
            reply.remove();
            //console.log(req.xhr);

            return res.json(200,{
                data:{
                    replyID:reply.id,
                },
                message:"Reply Deleted Successfully"
            })
            
        }

    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}

module.exports.updateReply=async function(req,res)
{
    try
    {
        let id=req.params.id;
        let reply=await commentReply.findById(id);
        if(reply.user.id==req.user.id)
        {
            if(!reply.update)
            {
                
                reply.update=true;
                reply.save();
                //console.log(req.xhr);
                return res.json(200,{
                    data:
                    {
                        replyID:id,
                        content:reply.content,
                        isReply:reply.isReply,
                        commentID:reply.comment
                    },
                    message:"Form Put"
                })
            
            }
            
        }
        else
        {
            req.flash("Error","You are not authorised to update this comment!");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error in updating comment ",err);
        return;
    }
}

module.exports.updateReply2=async function(req,res)
{
    try
    {
       // console.log(req.body);
        let id=req.body.reply;
        let reply=await commentReply.findById(id);
        if(reply.user.id==req.user.id)
        {
            if(!reply.isReply)
            {
                if(reply.content!=req.body.content)
                {
                        reply.edited=true;
                        reply.content=req.body.content;
                }
            }
            else
            {
                if(reply.content.content!=req.body.content)
                {
                        reply.edited=true;
                        await commentReply.findByIdAndUpdate(reply.id,{$set:{"content.content":req.body.content}});
                }
            }
            
            reply.update=false;
            reply.save();
            return res.json(200,{
                    data:
                    {
                        replyID:id,
                        content:req.body.content,
                        edited:reply.edited,
                        isReply:reply.isReply,
                        commentID:reply.comment
                    },
                    message:"Reply Updated Successfully"
            });
            
        }
        else
        {
            req.flash("error","You are not associated to update the comment");
            return res.redirect("back");
        }
    }
    catch(err)
    {
        console.log("error ",err);
        return;
    }
}

module.exports.destroyCommentReply=async function(req,res)
{
    try
    {
        let comment=await Comment.findById(req.params.id);
        let postId = comment.post;
        let post=await Post.findById(postId);
        if(comment.user.id==req.user.id || post.user==req.user.id)
        {
           
            await commentReply.deleteMany({_id:{$in:comment.replies}});
            for(reply of comment.replies)
            {
                await Like.deleteMany({likeable:reply._id,onModel:"CommentReply"});
            }
            comment.remove();
            post.comments.pull(comment);
            post.save();
            //CHANGE:: delete the likes of the comments
            await Like.deleteMany({likeable:comment._id,onModel:"Comment"});
            req.flash("success","See you, till the next time!");
            return res.redirect("/");
            
        }
        else
        {
            req.flash("error","You are not associated to delete the comment");
            return res.redirect("back");  
        }
    }
    catch(err)
    {
        console.log("Error: ",err);
        return;
    }
}

module.exports.replyReply1=async function(req,res)
{
    try{

        let id=req.params.id;
        let reply=await commentReply.findById(id).populate("user");
        return res.json(200,{
            data:{
                name:reply.user.name,
                userID:reply.user.id,
                commentID:reply.comment,
                replyID:reply.id
            },
            message:"New Reply Form Put"
        })
    }
    catch(err)
    {
        console.log("error in replying to the replies ",err);
        return
    }
}

module.exports.replyReply2=async function(req,res)
{
    try{

        let comment=await Comment.findById(req.body.comment);
        let reply=await commentReply.findById(req.body.reply);
        let post=await Post.findById(comment.post);
        if(comment)
        {
            let newContent={
                content:req.body.content,
                originalReplyID:reply.id,
                originalAuthorID:reply.user._id,
                originalAuthorName:reply.user.name,
            }
     
            let newReply=await commentReply.create({
                content:newContent,
                comment:req.body.comment,
                user:req.user._id,
                update:false,
                edited:false,
                isReply:true
            });
            newReply.populate("user","name email");
            let authorTag="";
            if(post.user==req.user.id)
            {
                authorTag="Author";
            }
            let user=await User.findById(req.user.id);
            let userImage=user.avatar;
            let userBgColor;
            if(!userImage)
            {
                userBgColor=user.info.bgColor;
            }
            comment.replies.push(newReply);
            comment.save();
            
            if(reply.user.id!=req.user.id)
            {
                
                let origianlUser=await User.findById(reply.user._id);
                let newNoty=await Noty.create({
                    user:req.user._id,
                    notyable:reply,
                    onModel:"CommentReply",
                    action:"replied"
                })
                if(!origianlUser.prevNotyOpen)
                {
                    origianlUser.oldNotyLength=origianlUser.noties.length;
                }
                origianlUser.noties.push(newNoty);
                origianlUser.save();

                let nextReply={
                    thought:newReply,
                    parentContent:reply.content.content,
                    type:"reply",
                    parentType:"thought"
                }

                let replyOnReply={
                    reply:newReply,
                    user:newReply.user,
                    email:reply.user.email,
                    content:reply.content
                }

                if(reply.isReply)
                {
                    replyOnReply.content=reply.content.content;
                }
           
               let job=queue.create("emails",nextReply).save(function(err)
               {
                   if(err)
                   {
                       console.log("error in creating a queue ",err);
                       return;
                   }
                   console.log("reply job enqueued " ,job.id);
    
               });
               let job3=queue.create("replyOnReplies",replyOnReply).save(function(err)
               {
                   if(err)
                   {
                       console.log("error in creating a queue ",err);
                       return;
                   }
                   console.log("reply job 3 enqueued " ,job3.id);
    
               });
            }
            if(comment.user.id!=req.user.id)
            {
                
                let replyOnComment={
                    reply:newReply,
                    user:newReply.user,
                    email:comment.user.email,
                    content:comment.content
                }
               let job2=queue.create("replyOnComments",replyOnComment).save(function(err)
               {
                   if(err)
                   {
                       console.log("error in creating a queue ",err);
                       return;
                   }
                   console.log("reply job 2 enqueued " ,job2.id);
    
               });
            }
            return res.status(200).json({
                data:{
                    replyUserImage:userImage,
                    replyUserBgColor:userBgColor,
                    replyUserName:user.name,
                    replyContent:newReply.content,
                    replyID:newReply.id,
                    commentID:req.body.comment,
                    replyUserID:user.id,
                    authorTag:authorTag,
                    isReply:reply.isReply
                },
                message:"Comment Reply Successfully published"
            });
        }
        
    }
    catch(err)
    {
        console.log("error in replying to the replies ",err);
        return
    }
}

module.exports.removeTag=async function(req,res)
{
    try{
        let id=req.params.id;
        let reply=await commentReply.findById(id);
        if(reply.user==req.user.id)
        {
            reply.content=reply.content.content;
            reply.isReply=false;
            reply.save();
            return res.json(200,{
                data:{
                    replyID:reply.id,
                },
                message:"Removetag Successfully!"
            })
        }
    }
    catch(err)
    {
        console.log("error in removing tag ",err);
        return;
    }
}