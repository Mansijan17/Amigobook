// module.exports.profile=function(req,res)
// {

//     //return res.end("<h1>User profile</h1>");
// }

module.exports.profile=function(req,res)
{
    return res.render("userProfile",{
        title:"User"
    });
    //return res.end("<h1>Express2 is up for Codeial</h1>")
}