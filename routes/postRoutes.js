const express = require('express');
const router = express.Router();
const password=require('passport');

const postController=require('../controllers/post_controller');

router.post("/create-post",password.checkAuthentication,postController.createPost);

module.exports=router;