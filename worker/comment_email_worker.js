const queue=require('../config/kue');
const commentsMailer=require('../mailer/comments_mailer');

queue.process("emails",function(job,done)
{
  //  console.log("comment email workers is processing the job ",job.data);
    commentsMailer.newCommentandReply(job.data);
    done();
});

queue.process("commentOnPosts",function(job,done)
{
   // console.log("post email workers is processing the job ",job.data);
    commentsMailer.newCommentOnPost(job.data);
    done();
});

queue.process("replyOnComments",function(job,done)
{
    commentsMailer.newReplyOnComment(job.data);
    done();
});

queue.process("replyOnReplies",function(job,done)
{
    commentsMailer.newReplyOnReply(job.data);
    done();
});