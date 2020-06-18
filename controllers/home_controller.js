const Post=require('../models/post');
const Comment=require('../models/commentSchema');
const User=require('../models/userSchema');

//making function async
module.exports.home = async function(req, res){

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
                let bgColor;
                if(user.avatar)
                {
                    img=user.avatar;
                }
                else
                {
                    bgColor=user.info.bgColor
                }
                let data={
                    name:user.name,
                    id:user._id,
                    avatar:img,
                    bgColor:bgColor
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