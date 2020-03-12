module.exports.home = function(req, res){
    console.log(req.cookies);
    res.cookie('user_id', 25);
    return res.render('home', {
        title: "Home"});
}


// module.exports.userProfile=function(req,res)
// {
//     return res.render("user_profile",{
//         title:"User"
//     });
//     //return res.end("<h1>Express2 is up for Codeial</h1>")
// }