const express = require('express');
const router = express.Router();
const password=require('passport');

const postController=require('../controllers/post_controller');

router.post("/create-post",password.checkAuthentication,postController.createPost);
router.get("/destroy-post/:id",password.checkAuthentication,postController.destroyPost);
module.exports=router;