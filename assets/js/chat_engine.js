class ChatEngine{

    constructor(chatBoxID,userEmail)
    {
        this.chatBox=$(`#${chatBoxID}`);
        this.userEmail=userEmail;
        this.socket=io.connect('http://localhost:5000');
        if(this.userEmail)
        {
            this.connectionHandler();
        }
    }

    connectionHandler()
    {
        let self=this;
        this.socket.on('connect',function()
        {
            console.log("connection established using sockets....!");
        });

        self.socket.emit("join_room",{
            user_email:self.userEmail,
            chatroom:"codeial",
        });

        self.socket.on("user_joined",function(data)
        {
            console.log("a user joined ",data);
        });

        $("#send-message").click(function () {

            let msg=$("#chat-message-input").val();
            if(msg!='')
            {
                self.socket.emit("send_message",{
                    message:msg,
                    user_email:self.userEmail,
                    chatroom:"codeial",
                });
            }
        
        });

        self.socket.on("receive_message",function(data)
        {
            console.log("message recieved ",data.message);
            let messageType="other-message";
            if(data.user_email==self.userEmail)
            {
                messageType="self-message";
            }
            $("#chat-messages-list").append(`<li class="${messageType}"><p class="user-descrpt">${data.user_email}</p><span>${data.message}</span></li>`);
        });

    }

    
}