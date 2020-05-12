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
            self.deleteReply($(this));
            console.log("delete replies");

        })
        $(" .update-reply-button" ,this.commentContainer).each(function()
        {
            self.updateReply($(this));
            console.log("update replies");
        })
        $(" .update-comment-button" ,this.commentContainer).each(function()
        {
            self.updateComment($(this));
            console.log("update comments");
        })
        $(" .comment-update-form" ,this.commentContainer).each(function()
        {
            self.updateCommentContent($(this));
            console.log("update comments content");
        })
        $(" .reply-update-form" ,this.commentContainer).each(function()
        {
            self.updateReplyContent($(this));
            console.log("update comment replies content");
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
                   <div class="dropdown bars">
                   <div class="dropdown-toggle" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                       <i class="fas fa-ellipsis-h"></i>
                   </div>
                   <div class="dropdown-menu drop-design" aria-labelledby="dropdownMenuLink">
                       <div class="dropdown-item" data-toggle="modal" data-target="#deleteReplyModal-${data.data.replyID}">
                         Delete <i class="fas fa-times" ></i> 
                       </div> 
                       <a class="dropdown-item update-reply-button" href="/comments/update-reply/${ data.data.replyID }" >Edit <i class="fas fa-pen-square"></i></a>
                     <a class="dropdown-item">Reply <i class="far fa-comment-dots"></i></a>
                     <a class="dropdown-item">Like <i class="far fa-thumbs-up"></i></a>
                   </div>
               </div>
                 <div class="modal fade" tabindex="-1" role="dialog" id="deleteReplyModal-${data.data.replyID}" aria-labelledby="exampleModalLabel" aria-hidden="true">
                   <div class="modal-dialog" role="document">
                     <div class="modal-content">
                       <div class="modal-header">
                         <h2 class="modal-title"><i class="fas fa-trash-alt"></i> Reply?</h2>
                       </div>
                       <div class="modal-body">
                         <p>Are you sure you want to delete it?</p>
                       </div>
                       <div class="modal-footer">
                         <a href="/comments/destroy-comment-reply/${data.data.replyID }" class="delete-reply-button btn btn-danger" data-dismiss="modal">Remove</a>
                         <button type="button" class="btn btn-light" data-dismiss="modal">Discard</button>
                       </div>
                     </div>
                   </div>
                 </div>
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

                  cSelf.deleteReply($(" .delete-reply-button",newReply));
                  cSelf.updateReply($(' .update-reply-button', newReply));
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
                        text: "Reply Deleted Successfully!",
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

    updateReply(updateLink)
    {
        
        $(updateLink).click(function(e)
        {
          
            e.preventDefault();
            $.ajax({
                type:"get",
                url:$(updateLink).prop("href"),
                success:function(data)
                {
                    console.log(data.data);
                   
                    $(`#reply-${ data.data.replyID} .reply-content`).remove();
                    $(`#reply-${ data.data.replyID}`).append(`<form action="/comments/update-reply-r2" method="post" class="reply-update-form">
                    <textarea required  name="content" >${ data.data.content}</textarea>
                    <input type="hidden" name="reply" value="${ data.data.replyID}">
                    <button type="submit">U</button>
                    </form>`)
                    
                    let upadeReplyContent=function()
                    {
                        console.log("h1");
                        $(".reply-update-form").submit(function(e)
                        {
                            console.log("h2");
                            e.preventDefault();
                            $.ajax({
                                type:"post",
                                url:"/comments/update-reply-r2",
                                data:$(".reply-update-form").serialize(),
                                success:function(data)
                                {
                                    console.log(data.data);
                                    if(data.data.edited)
                                    {
                                            $(`#reply-${data.data.replyID}`).prepend(`<span class="editedReply">Edited</span>`);
                                    }
                                    
                                    $(`#reply-${ data.data.replyID} form`).remove();
                                    $(`#reply-${ data.data.replyID} `).append(`<div class="reply-content">${data.data.content}</div>`);
                
                                    new Noty({
                                        theme:"relax",
                                        text:"Reply updated successfully!",
                                        type:"success",
                                        layput:"topRight",
                                        timeout:1500
                                    }).show();
                                },
                                error:function(err)
                                {
                                    console.log(err.responseText);
                                    return;
                                }
                            })
                        })
                    }
                    upadeReplyContent();
                },
                error:function(err)
                {
                    console.log("error ",err.responseText);
                }
            })
        })
    }


    updateReplyContent(form)
    {
        $(form).submit(function(e)
        {
            e.preventDefault();
            $.ajax({
                type:"post",
                url:"/comments/update-reply-r2",
                data:$(form).serialize(),
                success:function(data)
                {
                    console.log(data.data);
                    if(data.data.edited)
                    {
                            $(`#reply-${data.data.replyID}`).prepend(`<span class="editedReply">Edited</span>`);
                    }
                    
                    $(`#reply-${ data.data.replyID} form`).remove();
                    $(`#reply-${ data.data.replyID} `).append(`<div class="reply-content">${data.data.content}</div>`);

                    new Noty({
                        theme:"relax",
                        text:"Reply updated successfully!",
                        type:"success",
                        layput:"topRight",
                        timeout:1500
                    }).show();
                },
                error:function(err)
                {
                    console.log(err.responseText);
                    return;
                }
            })
        })
    }

    updateComment(updateLink)
    {
        console.log("up1",$(updateLink).prop("href"));
        $(updateLink).click(function(e)
        {
            console.log("up2");
            e.preventDefault();
            $.ajax({
                type:"get",
                url:$(updateLink).prop("href"),
                success:function(data)
                {
                    console.log("h111", data);
                   
                    $(`#comment-${ data.data.commentID}-reply .commentReplyContent`).remove();
                    $(`#comment-${ data.data.commentID}-reply .commentReplyClass .reply-body`).prepend(`<form action="/comments/update-comment-c2" method="post" class="comment-update-form">
                    <textarea required  name="content" >${ data.data.content}</textarea>
                    <input type="hidden" name="comment" value="${ data.data.commentID}">
                    <button type="submit">U</button>
                    </form>`)
                    
                    let upadeCommentContent=function()
                    {
                        console.log($(".comment-update-form"));
                        $(".comment-update-form").submit(function(e)
                        {
                            console.log("h2");
                            e.preventDefault();
                            $.ajax({
                                type:"post",
                                url:"/comments/update-comment-c2",
                                data:$(".comment-update-form").serialize(),
                                success:function(data)
                                {
                                    console.log(data.data);
                                    if(data.data.edited)
                                    {
                                            $(`#comment-${data.data.commentID}`).prepend(`<small class="comment-editedTag">
                                        Edited
                                        </small>`);
                                    }
                                    $(`#comment-${data.data.commentID}-reply .commentReplyClass .reply-body .comment-update-form`).remove();
                                    $(`#comment-${data.data.commentID}-reply .commentReplyClass .reply-body`).prepend(`<div class="commentReplyContent" id="comment-${data.data.commentID}-reply-content">
                                    ${data.data.content}
                                  </div>`);
                                    new Noty({
                                        theme:"relax",
                                        text:"Comment updated successfully!",
                                        type:"success",
                                        layput:"topRight",
                                        timeout:1500
                                    }).show();
                                },
                                error:function(err)
                                {
                                    console.log(err.responseText);
                                    return;
                                }
                            })
                        })
                    }
                    upadeCommentContent();
                },
                error:function(err)
                {
                    console.log("error ",err.responseText);
                }
            })
        })
    }

    updateCommentContent(form)
    {
        console.log("u c c1 ",$(form));
        $(form).submit(function(e)
        {
            console.log("u c c2");
            e.preventDefault();
            $.ajax({
                type:"post",
                url:"/comments/update-comment-c2",
                data:$(form).serialize(),
                success:function(data)
                {
                    console.log(data.data);
                    if(data.data.edited)
                    {
                            $(`#comment-${data.data.commentID}`).prepend(`<small class="comment-editedTag">
                        Edited
                        </small>`);
                    }
                    $(`#comment-${data.data.commentID}-reply .commentReplyClass .reply-body .comment-update-form`).remove();
                    $(`#comment-${data.data.commentID}-reply .commentReplyClass .reply-body`).prepend(`<div class="commentReplyContent" id="comment-${data.data.commentID}-reply-content">
                    ${data.data.content}</div>`);
                    new Noty({
                        theme:"relax",
                        text:"Comment updated successfully!",
                        type:"success",
                        layput:"topRight",
                        timeout:1500
                    }).show();
                },
                error:function(err)
                {
                    console.log(err.responseText);
                    return;
                }
            })
        })
    }
}