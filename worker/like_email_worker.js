const queue=require('../config/kue');
const likesMailer=require('../mailer/like_mailer');


queue.process("likeOnPostsandComments",function(job,done)
{
    //console.log("like email workers is processing the job ",job.data);
    likesMailer.newLikeOnPostsandComments(job.data);
    done();
});