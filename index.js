const express=require('express');
const port=8000;
const app=express();

const expressLayouts=require('express-ejs-layouts');
app.use(expressLayouts);

//for form and make sure to put it above router
app.use(express.urlencoded());
//use express router
app.use("/",require("./routes"));

app.set("view engine","ejs");
app.set("views","./views");
app.listen(port,function(err)
{
    if(err)
    {
        console.log(`Error : ${err}`);
        return;
    }
    console.log(`Server running fine on port ${port}`);
})

