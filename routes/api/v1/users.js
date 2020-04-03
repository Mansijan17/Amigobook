const express=require('express');
const router=express.Router();
const UserAPIController=require('../../../controllers/api/v1/users_api');

router.post("/create-session",UserAPIController.createSession);


module.exports=router;