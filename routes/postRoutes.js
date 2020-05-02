const express = require('express');
const router = express.Router();
const password=require('passport');

const postController=require('../controllers/post_controller');


router.post("/create-post",password.checkAuthentication,postController.createPost);
router.get("/destroy-post/:id",password.checkAuthentication,postController.destroyPost);
router.post("/update-post/:id",password.checkAuthentication,postController.updatePost);
router.post("/update-post-p2/",password.checkAuthentication,postController.updatePost2);
router.post("/share-post/",password.checkAuthentication,postController.sharePost);

module.exports=router;