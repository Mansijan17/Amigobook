const Post=require('../models/post');
const Comment=require('../models/commentSchema');
const User=require('../models/userSchema');

//making function async
module.exports.home = async function(req, res){

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
    

    // //populating the user of each post schema
    // Post.find({}).populate("user").populate({
    //     //populating the comments of the post schema
    //     path:"comments",
    //     populate:
    //     {
    //         //populating users of the comment from the comment schema
    //         path:"user",
    //     }
    // }).exec(function(err,postLists)
    // {
    //     if(err)
    //     {
    //         console.log("Error in fetching data from db");
    //         return;
    //     }

    //     User.find({},function(err,users)
    //     {
    //         return res.render('home', {
    //             title: "Home",
    //             posts:postLists,
    //             all_users:users});
            
    //     })

        
    // })

    try
    {
        let postLists=await Post.find({}).sort("-createdAt").populate("user").populate({
                //populating the comments of the post schema
                //Change:: populate the likes of the posts and comments
                path:"comments",
                options:{
                    sort:"-createdAt"
                },
                
                populate:
                ({
                    path:"likes",
                    options:{
                        sort:"-createdAt"
                    },
                    populate:{
                        path:"user"
                    },
                   
                  
                }),
              
                
            }).populate({
                path:"likes",
                options:{
                    sort:"-createdAt"
                },
                populate:{
                    path:"user"
                }
            }).populate({
                path:"shares",
                options:{
                    sort:"-createdAt"
                },
                populate:{
                    path:"user"
                }
            });
       // await Comment.find({}).sort("-createdAt");
      // console.log(postLists.comments);
     
        let users=await User.find({});
       // console.log(users);
        return res.render('home', {
                        title: "Socialends",
                        posts:postLists,
                        all_users:users});

    }
    catch(err)
    {
        console.log("Error ",err);
        return;
    }
    
                
            
   
}


// module.exports.userProfile=function(req,res)
// {
//     return res.render("user_profile",{
//         title:"User"
//     });
//     //return res.end("<h1>Express2 is up for Codeial</h1>")
// }