const mongoose=require('mongoose');

const notySchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    notyable:{
        type:mongoose.Schema.ObjectId,
        required:true,
        refPath:"onModel"
    },
    onModel:{
        type:String,
        required:true,
        enum:["Post","Comment","CommentReply"]
    },
    action:{
        type:String,
        required:true,
        enum:["liked","commented","replied","shared"]
    },
},
{
    timestamps:true
});

const Noty=mongoose.model("Noty",notySchema);
module.exports=Noty;