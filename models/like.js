const mongoose=require('mongoose');

const likeSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
    },
    //defining the object of the liked object
    likeable:{
        type:mongoose.Schema.ObjectId,
        required:true,
        refPath:"onModel"
    },
    //defining the type of the liked object since it is dynamic reference
    onModel:{
        type:String,
        required:true,
        enum:["Post","Comment"]
    }
},
{
    timestamps:true
});

const Like=mongoose.model("Like",likeSchema);
module.exports=Like;