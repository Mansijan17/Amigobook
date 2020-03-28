const express=require('express');
const router=express.Router();

const homeController=require("../controllers/home_controller");

console.log("router loaded");
//calling home controller
router.get("/",homeController.home);
//calling "/users/" user controller
router.use("/users",require("./users"));
router.use("/posts",require("./postRoutes"));
router.use("/comments",require("./commentRoutes"));
router.use("/api",require("./api/apiIndex"));

module.exports=router;