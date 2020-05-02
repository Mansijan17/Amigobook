const mongoose=require('mongoose');

const shareSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    //defining the object of the liked object
    post:{
        type:mongoose.Schema.ObjectId,
        ref:"Post",
        required:true
    },
    createdPost:{
        type:mongoose.Schema.ObjectId,
        ref:"Post",
        required:true
    }
   
},
{
    timestamps:true
});

const Share=mongoose.model("Share",shareSchema);
module.exports=Share;