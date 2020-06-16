const express=require('express');
const router=express.Router();
const passport=require('passport');
const notyController=require('../controllers/noty_controller');

router.get("/",passport.checkAuthentication,notyController.showNotyList);

module.exports=router;