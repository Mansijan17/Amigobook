const mongoose=require('mongoose');

const newAccountSchema=new mongoose.Schema({
    user:
    {
        type:Object
    },
    acessToken:{
        type:String,
    },
},{
    timestamps:true
});

const newAccountCollection=mongoose.model("newAccountCollection",newAccountSchema);
module.exports=newAccountCollection;