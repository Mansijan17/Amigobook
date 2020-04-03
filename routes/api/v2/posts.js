const express=require('express');
const router=express.Router();
const postAPIV2=require("../../../controllers/api/v2/posts_api");

router.get("/",postAPIV2.index);

module.exports=router;