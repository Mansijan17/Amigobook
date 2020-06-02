const mongoose=require('mongoose');

const friendshipSchema=new mongoose.Schema({
    
    fromUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    toUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        autopopulate:true,
        required:true
    },
    
});
friendshipSchema.plugin(require('mongoose-autopopulate'));
const Friendship=mongoose.model("Friendship",friendshipSchema);
module.exports=Friendship;