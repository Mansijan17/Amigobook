const express = require('express');
const router = express.Router();
const password=require('passport');

const commentController=require('../controllers/comment_controller');


router.post("/create-comment",password.checkAuthentication,commentController.createComment);
router.get("/destroy-comment/:id",password.checkAuthentication,commentController.destroyComment);
router.get("/update-comment/:id",password.checkAuthentication,commentController.updateComment);
router.post("/update-comment-c2/",password.checkAuthentication,commentController.updateComment2);
router.post("/create-comment-reply/",password.checkAuthentication,commentController.createReply);
module.exports=router;