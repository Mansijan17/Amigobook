const express=require('express');
const router=express.Router();
const userController=require("../controllers/users_controller");

router.get("/signin",userController.signIn);
router.get("/profile",userController.profile);
router.get("/signup",userController.signUp);
router.post("/create",userController.createUser);
module.exports=router;