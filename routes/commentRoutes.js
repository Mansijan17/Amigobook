const express = require('express');
const router = express.Router();
const password=require('passport');

const commentController=require('../controllers/comment_controller');

router.post("/create-comment",password.checkAuthentication,commentController.createComment);
router.get("/destroy-comment/:id",password.checkAuthentication,commentController.destroyComment);

module.exports=router;