const mongoose=require('mongoose');

const resetPasswordSchema=new mongoose.Schema({
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    acessToken:{
        type:String,
    },
    isvalid:{
        type:Boolean,
    }
},{
    timestamps:true
});

const resetPasswordCollection=mongoose.model("resetPasswordCollection",resetPasswordSchema);
module.exports=resetPasswordCollection;