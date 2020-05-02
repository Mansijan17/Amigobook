const mongoose=require('mongoose');

const postSchema=new mongoose.Schema({
    content:
    {
        type:Object,
        required:true
    },
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    //including the array of ids of all comments in this post itself
    comments:
    [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment",
           // autopopulate:true
        }
    ],
    likes:[
        {   
            type:mongoose.Schema.Types.ObjectId,
            ref:"Like",
            autopopulate:true
        }
    ],
    shares:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Share"
        }
    ],
    update:{
        type:Boolean,
        required:true
    },
    sharedFromPost:{
        type:Boolean,
        required:true
    }
},
{
    timestamps:true
});
//postSchema.plugin(require('mongoose-autopopulate'));
const Post=mongoose.model("Post",postSchema);
module.exports=Post;