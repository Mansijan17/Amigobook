const queue=require('../config/kue');
const postsMailer=require('../mailer/post_mailer');

queue.process("posts",function(job,done)
{
    console.log("post workers is processing the job ",job.data);
    postsMailer.newPost(job.data);
    done();
});