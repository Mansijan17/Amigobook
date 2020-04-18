const queue=require('../config/kue');
const newAccountMailer=require('../mailer/new_account_confirmEmail');

queue.process("newAccount",function(job,done)
{
    console.log("email workers is processing the job ",job.data);
    newAccountMailer.newAccount(job.data);
    done();
})