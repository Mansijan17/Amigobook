const User=require("../models/userSchema");
const Noty=require("../models/noty");

module.exports.showNotyList=async function(req,res)
{
    try{
        let user=await User.findById(req.query.id).populate({
            path:"noties",
            populate:{
                path:"user notyable"
            },
            options:{
                sort:"-createdAt"
            }
        });
        let noties=user.noties;
        user.prevNotyOpen=true;
        user.oldNotyLength=noties.length;
        user.save();
        console.log("noty contr ",noties.length);
        return res.render("notyList",{
            title:"Your's Noty | Skyinyou",
            noties:noties
        })
    }
    catch(err)
    {
        console.log("error in rendering noty list ",err);
        return;
    }
}