const User=require('../../../models/userSchema');
const jwt=require('jsonwebtoken');

module.exports.createSession = async function (req, res) {
 
    try
    {
        let user=await User.findOne({email:req.body.email});
        if(!user || user.password!=req.body.password)
        {
            return res.json(422,{
                message:"Inavlid User/Password"
            });
        }
        return res.json(200,{
            message:"Sign In successfully,here is your token,please keep it safe!",
            data:{
                token:jwt.sign(user.toJSON(),"codeial",{expiresIn:"100000"}),
            }
        })
    }
    catch(err)
    {
        console.log("******* ",err);
        return res.json(500,{
            message:"Internal Server Error"
        });
    }
    
}
