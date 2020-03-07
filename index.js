const express=require('express');
const cookieParser=require('cookie-parser');
const port=8000;


const app=express();
app.use(express.urlencoded());
app.use(express.static("assets"));
app.use(cookieParser());

const expressLayouts=require('express-ejs-layouts');
const db=require('./config/mongoose');
app.use(expressLayouts);
//extract styles and scripts from sub pages to layout
app.set("layout extractStyles",true);
app.set("layout extractScripts",true);

//for form and make sure to put it above router

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

