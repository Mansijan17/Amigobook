module.exports.home=function(req,res)
{
    return res.render("home",{
        title:"home",
        heading:"This is my home"
    });
    // return res.end("<h1>Express is up for Codeial</h1>")
}

// module.exports.userProfile=function(req,res)
// {
//     return res.render("user_profile",{
//         title:"User"
//     });
//     //return res.end("<h1>Express2 is up for Codeial</h1>")
// }