const queue=require('../config/kue');
const likesMailer=require('../mailer/like_mailer');


queue.process("likeOnPostsandCommentsandReplies",function(job,done)
{
    //console.log("like email workers is processing the job ",job.data);
    likesMailer.newLikeOnPostsandCommentsandReplies(job.data);
    done();
});