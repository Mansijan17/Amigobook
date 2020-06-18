const mongoose=require('mongoose');
const env=require("./environment");
//use this for robo 3t
mongoose.connect(`mongodb://localhost/${env.db}`);

//this is for mongo db atlas
// const URL = `mongodb+srv://Manjari:2216Manjari%23@cluster0.rqggs.mongodb.net/${env.db}?retryWrites=true&w=majority`
// mongoose.connect(URL,{
//     useUnifiedTopology:true,
//     useNewUrlParser:true
// });

const db=mongoose.connection;
db.on("error",console.error.bind(console,"error connecting to db"));
db.once("open",function()
{
    console.log("Successfully connected to mongodb");
});
module.exports=db;