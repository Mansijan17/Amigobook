const Post=require('../models/post');
const Comment=require('../models/commentSchema');

module.exports.home = function(req, res){

    // Post.find({},function(err,postLists)
    // {
        // if(err)
        // {
        //     console.log("Error in fetching data from db");
        //     return;
        // }
        // // console.log(req.cookies);
        // // res.cookie('user_id', 25);
        // return res.render('home', {
        // title: "Home",
        // posts:postLists});
    // })
    

    //populating the user of each post schema
    Post.find({}).populate("user").populate({
        //populating the comments of the post schema
        path:"comments",
        populate:
        {
            //populating users of the comment from the comment schema
            path:"user",
        }
    }).exec(function(err,postLists)
    {
        if(err)
        {
            console.log("Error in fetching data from db");
            return;
        }
        return res.render('home', {
        title: "Home",
        posts:postLists});
    })
   
}


// module.exports.userProfile=function(req,res)
// {
//     return res.render("user_profile",{
//         title:"User"
//     });
//     //return res.end("<h1>Express2 is up for Codeial</h1>")
// }