const express=require('express');
const router=express.Router();
const passport=require('passport');
const homeController=require("../controllers/home_controller");


console.log("router loaded");
//calling home controller
router.get("/",homeController.home);
router.get("/search",passport.checkAuthentication,homeController.searchFunction);

//calling "/users/" user controller
router.use("/users",require("./users"));
router.use("/posts",require("./postRoutes"));
router.use("/comments",require("./commentRoutes"));
router.use("/api",require("./api/apiIndex"));
router.use("/likes",require("./likes"));
router.use("/noty",require("./noty"));


module.exports=router;