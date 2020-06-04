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
        for(post of postLists)
        {
            post.update=false;
            post.save();
            for(comment of post.comments)
            {
                comment.update=false;
                comment.save();
            }
        }
        let comments=await Comment.find({});
        for(comment of comments)
        {
            comment.update=false;
            comment.save();
        }
       // await Comment.find({}).sort("-createdAt");
      // console.log(postLists.comments);
     
        let users=await User.find({});
       // console.log(users);
        return res.render('home', {
                        title: "Skyinyou",
                        posts:postLists,
                        all_users:users});

    }
    catch(err)
    {
        console.log("Error ",err);
        return;
    }
    
                
            
   
}

module.exports.searchFunction=async function(req,res)
{
    try{
        let searchItem=req.query.search;
        if(searchItem.length>1)
        {
            regExpression=new RegExp(searchItem,'i');
            let usersFound=await User.find({name:regExpression});
            let found=[];
            for(user of usersFound)
            {
                let img;
                if(user.avatar)
                {
                    img=user.avatar;
                }
                else if(user.gender=="male")
                {
                    img="https://i.stack.imgur.com/HQwHI.jpg"
                }
                else
                {
                    img="/images/femaleProfile.png"
                }
                let data={
                    name:user.name,
                    id:user._id,
                    avatar:img
                }
                found.push(data)
            }
            return res.json(200,{
                data:{
                    usersFound:found
                },
                message:"Users found successfully!"
            })
        }
    }
    catch(err)
    {
        console.log(err);
        return;
    }
}