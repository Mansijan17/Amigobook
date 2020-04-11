const queue=require('../config/kue');
const newpasswordMailer=require('../mailer/resetpassword_mailer');

queue.process("password",function(job,done)
{
    console.log("email workers is processing the job ",job.data);
    newpasswordMailer.newPassword(job.data);
    done();
})