const mongoose=require('mongoose');

const postSchema=new mongoose.Schema({
    content:
    {
        type:String,
        required:true
    },
    displayLikes:
    {
        type:Boolean,
    },
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
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
    ]
},
{
    timestamps:true
});
//postSchema.plugin(require('mongoose-autopopulate'));
const Post=mongoose.model("Post",postSchema);
module.exports=Post;