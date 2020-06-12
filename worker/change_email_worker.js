const queue=require('../config/kue');
const changeEmailMailer=require('../mailer/change_email_mailer');

queue.process("changeEmail",function(job,done)
{
    //console.log("email workers is processing the job ",job.data);
    changeEmailMailer.changeEmail(job.data);
    done();
});

queue.process("changeEmailConfirm",function(job,done)
{
    //console.log("email workers is processing the job ",job.data);
    changeEmailMailer.changeEmailConfirm(job.data);
    done();
});