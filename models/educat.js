const mongoose=require('mongoose');


const gradSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        refer:"User"
    },
    grade:{
        type:String,
        required:true
    },
    school:
    {
        type:String,
        required:true
    },
    descrpt:{
        type:String
    },
    check:
    {
        type:String,
    },
    fromMonth:
    {
        type:String,
        required:true
    },
    fromYear:
    {
        type:String,
        required:true
    },
    toMonth:
    {
        type:String,
    },
    toYear:
    {
        type:String,
    },

 
},{
    timestamps:true
});


const Graduate=mongoose.model("Graduate",gradSchema);
module.exports=Graduate;