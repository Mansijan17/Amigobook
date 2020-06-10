const mongoose=require('mongoose');


const workSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        refer:"User"
    },
    title:{
        type:String,
        required:true
    },
    company:
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


const Work=mongoose.model("Work",workSchema);
module.exports=Work;