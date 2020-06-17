const express=require('express');
const router=express.Router();
const passport=require('passport');
const frController=require('../controllers/fr_controller');

router.get("/",passport.checkAuthentication,frController.showFRList);

module.exports=router;