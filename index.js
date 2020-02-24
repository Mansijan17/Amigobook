// const express=require('express');
// const port=8000;
// const app=express();

// app.listen(port,function(err)
// {
//     if(err)
//     {
//         console.log(`Error : ${err}`);
//         return;
//     }
//     console.log(`Server running fine on port ${port}`);
// })

const express=require('express');
const path=require('path');
const port=8000;

const app=express();
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded());
app.use(path.join(__dirname,'assets'),function(req,res)
{
  console.log("hiii");
});

//midleware 1
//app.use(function(req,res,next)
//{
 // req.myname="arpan";
 //console.log("midleware1 called");
// next();
//}
//);
//midleware2
//app.use(function(req,res,next)
//{  
 //   console.log("my name called from mw2",req.myname);
 // console.log("middleware2 called");
  //next();
//}
//);

var contactlist=[
  {name:"Vijay",phone:"444444"},
  {name:"Kumar",phone:"555555"},
  {name:"Arpan",phone:"666666"}
  
  
]
app.post('/create-list',function(req,res)
{
 contactlist.push(
   {
     name:req.body.name,
     phone:req.body.phone
   }
 );
 return  res.redirect('/');
}
);
app.get('/',function(req,res)
{ 
  
return res.render('home',{
    title:"lets play with home page",
    contact:contactlist
    
}); 
}
);
app.get('/practice',function(req,res)
{
  return res.render('practice',{
      title:"lets play with ejs"
  });
});



app.listen(port,function(err)

{
if(err) 
{console.log("error in running the server",err)}; 
console.log("running on server",port);
}


);
