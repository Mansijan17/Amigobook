const express = require('express');
const router = express.Router();
const password=require('passport');

const commentController=require('../controllers/comment_controller');


router.post("/create-comment",password.checkAuthentication,commentController.createComment);
router.get("/destroy-comment/:id",password.checkAuthentication,commentController.destroyComment);
router.get("/update-comment/:id",password.checkAuthentication,commentController.updateComment);
router.post("/update-comment-c2/",password.checkAuthentication,commentController.updateComment2);
router.get("/replies/:id",password.checkAuthentication,commentController.showReply);
router.post("/create-comment-reply/",password.checkAuthentication,commentController.createReply);
router.get("/destroy-comment-reply/:id",password.checkAuthentication,commentController.deleteReply);
module.exports=router;