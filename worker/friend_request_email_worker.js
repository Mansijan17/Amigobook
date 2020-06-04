const queue=require('../config/kue');
const friendRequestMailer=require('../mailer/friend_request_mailer');

queue.process("friendrequestrecieved",function(job,done)
{
    friendRequestMailer.newFriendRequestRecieved(job.data);
    done();
});

queue.process("friendrequestaccepted",function(job,done)
{
    friendRequestMailer.FriendRequestAccepted(job.data);
    done();
});
