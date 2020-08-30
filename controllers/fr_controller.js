const User=require("../models/userSchema");

module.exports.showFRList=async function(req,res)
{
    try{
        let user=await User.findById(req.query.id).populate({
            path:"pendFR",
            populate:{
                path:"fromUser"
            },
            options:{
                sort:"-createdAt"
            }
        });
        let frs=user.pendFR;
        user.prevPendFROpen=true;
        user.oldPendFRLength=frs.length;
        user.save();
        //console.log("fr contr ",frs.length);
        return res.render("frList",{
            title:"Your's Friend Requests | AMIGOBOOK",
            frs:frs
        })
    }
    catch(err)
    {
        console.log("error in rendering noty list ",err);
        return;
    }
}