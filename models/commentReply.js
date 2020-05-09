const mongoose=require('mongoose');

const commentReply=new mongoose.Schema({
    content:
    {
        type:String,
        required:true,
    },
    //comments belongs to the post
    comment:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        required:true,
    },
     //comments belongs to the user
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        autopopulate:true,
        required:true
    },
    likes:[
        {   
            type:mongoose.Schema.Types.ObjectId,
            ref:"Like"
        }
    ],
    update:
    {
        type:Boolean,
        required:true
    },
    edited:
    {
        type:Boolean,
        required:true,
    },
    

},{
    timestamps:true
});
commentReply.plugin(require('mongoose-autopopulate'));
const CommentReply=mongoose.model("CommentReply",commentReply);
module.exports=CommentReply;