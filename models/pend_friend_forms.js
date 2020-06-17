const mongoose=require('mongoose');

const pendingFriendshipForm=new mongoose.Schema({

    isFormSent:{
        type:Boolean,
        required:true
    },
    fromUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    toUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    
},{
    timestamps:true
});

const FriendshipForm=mongoose.model("FriendshipForm",pendingFriendshipForm);
module.exports=FriendshipForm;