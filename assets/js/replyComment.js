class replyOnComment{
    constructor(replyCommentForm)
    {
        this.replyForm=replyCommentForm;
        this.reply();
    }

    reply()
    {
        let newReplyForm=$(this.replyForm);
        
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
                   console.log($(`#comment-${data.data.commentID}-reply-list`))
                   $(`#comment-${data.data.commentID}-reply-list`).prepend($(`<li id="reply-${data.data.replyID}">
                   <div class="reply-author-tag">
                       <a href="/users/profile/${data.data.replyUserID}">
                         
                           <img src="${data.data.replyUserImage}">
                           <span>${data.data.replyUserName}</span>
                           <span class="${data.data.authorTag}-tag" style="width: 45px;"> ${data.data.authorTag}</span>
                           
                       </a>
                   </div>
               
                   <div class="reply-content">${ data.data.replyContent}</div>
                   
                  </li>`));
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
}