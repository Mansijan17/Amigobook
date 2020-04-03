const express=require('express');
const router=express.Router();

router.use("/v1",require("./v1/v1Index"));
router.use("/v2",require("./v2/v2Index"));

module.exports=router;