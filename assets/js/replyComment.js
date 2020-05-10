class replyOnComment{
    constructor(replyCommentForm)
    {
        this.replyForm=replyCommentForm;
        let id=this.replyForm["id"].split("-")[1];
        this.commentContainer=$(`#comment-${id}-reply`)
        console.log(this.commentContainer);
        this.reply(id);
        let self=this;
        $(" .delete-reply-button" ,this.commentContainer).each(function()
        {
            //let updateButton=$(" .update-post-button",self);
           // updatePost(updateButton);
            self.deleteReply($(this));
            console.log("delete replies");

        })
    }

    reply(commentID)
    {
        let newReplyForm=$(this.replyForm);
        let cSelf=this;
        
        newReplyForm.submit(function(e)
        {
            console.log(newReplyForm);
            e.preventDefault();
            $.ajax({
                type:"post",
                url:"/comments/create-comment-reply",
                data:newReplyForm.serialize(),
                success:function(data)
                {
                   console.log(data.data,data.data.commentID);
                   console.log($(`#comment-${data.data.commentID}-reply-list`));
                   let newReply=$(`<li id="reply-${data.data.replyID}">
                   <div class="reply-author-tag">
                       <a href="/users/profile/${data.data.replyUserID}">
                         
                           <img src="${data.data.replyUserImage}">
                           <span>${data.data.replyUserName}</span>
                           <span class="${data.data.authorTag}-tag" style="width: 45px;"> ${data.data.authorTag}</span>
                           
                       </a>
                   </div>
               
                   <div class="reply-content">${ data.data.replyContent}</div>
                   
                  </li>`);
                   $(`#comment-${data.data.commentID}-reply-list`).prepend(newReply);

                  cSelf.deleteReply($(" .delete-reply-button",newReply))
                    new Noty({
                        theme:"relax",
                        text:"Reply Added Successfully!",
                        type:"success",
                        layput:"topRight",
                        timeout:1500
                    }).show();
                },
                error:function(err)
                {
                    console.log("err********", err.responseText);
                    return;
                }
            })
        })
        
    }

    deleteReply(deleteLink){
        $(deleteLink).click(function(e){
            e.preventDefault();
            console.log("inside delete reply button ");
            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data){
                
                    console.log("remove comment reply: ",data.data);
                    $(`#reply-${data.data.replyID}`).remove();
                    
                    new Noty({
                        theme: 'relax',
                        text: "Comment Deleted!",
                        type: 'success',
                        layout: 'topRight',
                        timeout: 1500
                        
                    }).show();
                },error: function(error){
                    console.log(error.responseText);
                }
            });

        });
    }
}