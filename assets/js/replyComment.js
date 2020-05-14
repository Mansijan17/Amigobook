class replyOnComment{
    constructor(replyCommentForm)
    {
        this.replyForm=replyCommentForm;
        let id=this.replyForm["id"].split("-")[1];
        this.commentContainer=$(`#comment-${id}-reply`)
        console.log(this.commentContainer);
        this.reply(id);
        this.commentID=id;
        let self=this;
        $(" .update-comment-button" ,this.commentContainer).each(function()
        {
            self.updateComment($(this));
            console.log("update comments");
        })
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
        $(" .reply-reply-button" ,this.commentContainer).each(function()
        {
            self.replyReply1($(this));
            console.log("reply reply 1");
        })
        $(" .removetag-button" ,this.commentContainer).each(function()
        {
            self.removeTag($(this));
            console.log("reply remove");
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
                   let newReply=$(`<li id="reply-${data.data.replyID}" onmouseup="removetagInvisible()">
                   <div class="dropdown bars">
                   <div class="dropdown-toggle" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                       <i class="fas fa-ellipsis-h"></i>
                   </div>
                   <div class="dropdown-menu drop-design" aria-labelledby="dropdownMenuLink">
                       <div class="dropdown-item" data-toggle="modal" data-target="#deleteReplyModal-${data.data.replyID}">
                         Delete <i class="fas fa-times" ></i> 
                       </div> 
                       <a class="dropdown-item update-reply-button" href="/comments/update-reply/${ data.data.replyID }" >Edit <i class="fas fa-pen-square"></i></a>
                     <a class="dropdown-item reply-reply-button" href="/comments/reply-reply-r1/${data.data.replyID}">Reply <i class="far fa-comment-dots"></i></a>
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
               
                   <div class="reply-content" id="reply-${data.data.replyUserID}-content">${ data.data.replyContent}</div>
                   
                  </li>`);
                   $(`#comment-${data.data.commentID}-reply-list`).prepend(newReply);

                  cSelf.deleteReply($(" .delete-reply-button",newReply));
                  cSelf.updateReply($(' .update-reply-button', newReply));
                  cSelf.replyReply1($(' .reply-reply-button', newReply));
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
                
                    console.log("remove comment reply: ",data.data,$(`#reply-${data.data.replyID}`));
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
                    console.log("h111", data.data.content);
                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a i`).css("pointer-events","none");
                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a`).css("cursor","no-drop");
                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form button`).css("pointer-events","none");
                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form`).css("cursor","no-drop");
                    $(`#comment-${data.data.commentID}-reply-list>li>.bars>.dropdown-toggle`).each(function()
                    {
                        let self=$(this);
                        let i=$(" i",self);
                        console.log(i);
                        i.css("pointer-events","none");
                        self.css("cursor","no-drop");
                        
                    })
                    if(!data.data.isReply)
                    {
                        $(`#reply-${ data.data.replyID} .reply-content`).remove();
                        $(`#reply-${ data.data.replyID}`).append(`<form action="/comments/update-reply-r2" method="post" class="reply-update-form">
                        <textarea required  name="content" onkeydown="autosize1(this)">${ data.data.content}</textarea>
                        <input type="hidden" name="reply" value="${ data.data.replyID}">
                        <button type="submit">U</button>
                        </form>`)
                    }
                    else{
                        let str=data.data.content.content.trim();
                        $(`#reply-${ data.data.replyID} .reply-content .replyreplycontent`).remove();
                        $(`#reply-${ data.data.replyID} .reply-content`).append(`<form action="/comments/update-reply-r2" method="post" class="reply-update-form"
                        style="       margin: 0;
                        margin-right: 0;
                        margin-top: -6px;
                        display: flex;
                        justify-content: space-around;
                        min-height: 30px;
                        width: 86%;">
                        <textarea required  name="content" onkeydown="autosize1(this)">${str}</textarea>
                        <input type="hidden" name="reply" value="${data.data.replyID}">
                        <button type="submit" style="align-self:center;" class="reply2button">U</button>
                        </form>`)
                    }
                    
                    
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
                                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form button`).css("pointer-events","auto");
                                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form`).css("cursor","pointer");
                                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a i`).css("pointer-events","auto");
                                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a`).css("cursor","pointer");
                                    $(`#comment-${data.data.commentID}-reply-list>li>.bars>.dropdown-toggle`).each(function()
                                    {
                                        let self=$(this);
                                        let i=$(" i",self);
                                        console.log(i);
                                        i.css("pointer-events","auto");
                                        self.css("cursor","pointer");
                                        
                                    })
                                    if(data.data.edited)
                                    {
                                            $(`#reply-${data.data.replyID}`).prepend(`<span class="editedReply">Edited</span>`);
                                    }
                                    
                                    $(`#reply-${ data.data.replyID} form`).remove();
                                    if(!data.data.isReply)
                                    {
                                        $(`#reply-${ data.data.replyID} `).append(`<div class="reply-content">${data.data.content}</div>`);
                                    }
                                    else
                                    {
                                        console.log("reply hai");
                                        $(`#reply-${ data.data.replyID} .reply-content`).append(`<span class="replyreplycontent">${data.data.content}</span>`);
                                    }
                
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
                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form button`).css("pointer-events","none");
                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form`).css("cursor","no-drop");
                    $(`#comment-${data.data.commentID}-reply-list>li>.bars>.dropdown-toggle`).each(function()
                    {
                        let self=$(this);
                        let i=$(" i",self);
                        console.log(i);
                        i.css("pointer-events","none");
                        self.css("cursor","no-drop");
                        
                    })
                    $(`#comment-${ data.data.commentID}-reply .commentReplyContent`).remove();
                    $(`#comment-${ data.data.commentID}-reply .commentReplyClass .reply-body`).prepend(`<form action="/comments/update-comment-c2" method="post" class="comment-update-form">
                    <textarea required  name="content" onkeydown="autosize1(this)">${data.data.content}</textarea>
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
                                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form button`).css("pointer-events","auto");
                                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form`).css("cursor","pointer");
                                    $(`#comment-${data.data.commentID}-reply-list>li>.bars>.dropdown-toggle`).each(function()
                                    {
                                        let self=$(this);
                                        let i=$(" i",self);
                                        console.log(i);
                                        i.css("pointer-events","auto");
                                        self.css("cursor","pointer");
                                        
                                    })
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

    replyReply1(replyLink)
    {
        
        let cSelf=this; 
        $(replyLink).click(function(e)
        {
            e.preventDefault();
            $.ajax({
                type:"get",
                url:$(replyLink).prop("href"),
                success:function(data)
                {
                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a i`).css("pointer-events","none");
                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a`).css("cursor","no-drop");
                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form button`).css("pointer-events","none");
                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form`).css("cursor","no-drop");
                    $(`#comment-${data.data.commentID}-reply-list>li>.bars>.dropdown-toggle`).each(function()
                    {
                        let self=$(this);
                        let i=$(" i",self);
                        console.log(i);
                        i.css("pointer-events","none");
                        self.css("cursor","no-drop");
                        
                    })
                    $(`#comment-${data.data.commentID}-reply-list`).append(`<li class="reply-form-list"><form action="/comments/reply-reply-r2" method="post" class="reply-reply-form">
                    <div class="div1">
                        <input type="text" name="userName" value="${data.data.name}" disabled>
                        <input type="hidden" name="userID" value="${data.data.userID}" >
                    </div>
                    <div class="div2">
                        <textarea required  name="content" onkeydown="autosize1(this)"></textarea>
                        <input type="hidden" name="comment" value="${ data.data.commentID}">
                        <input type="hidden" name="reply" value="${ data.data.replyID}">
                        <button type="submit">R</button>
                    </div>
                    </form></li>`);
                    let postReplyReply=function(comment)
                    {
                        let cSelf=comment;
                        $(".reply-reply-form").submit(function(e)
                        {
                            console.log("yes2");
                            e.preventDefault();
                            $.ajax({
                                type:"post",
                                url:"/comments/reply-reply-r2",
                                data:$(".reply-reply-form").serialize(),
                                success:function(data)
                                {
                                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a i`).css("pointer-events","auto");
                                    $(`#comment-${data.data.commentID}-reply .comment-update-tag a`).css("cursor","pointer");
                                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form button`).css("pointer-events","auto");
                                    $(`#comment-${data.data.commentID}-reply .reply-body .comment-reply-form`).css("cursor","pointer");
                                    $(`#comment-${data.data.commentID}-reply-list>li>.bars>.dropdown-toggle`).each(function()
                                    {
                                        let self=$(this);
                                        let i=$(" i",self);
                                        console.log(i);
                                        i.css("pointer-events","auto");
                                        self.css("cursor","pointer");
                                        
                                    })
                                    $('.reply-form-list').remove();
                                    let newReply=$(`<li id="reply-${data.data.replyID}" onmouseup="removetagInvisible()">
                                    <div class="dropdown bars">
                                    <div class="dropdown-toggle" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-ellipsis-h"></i>
                                    </div>
                                    <div class="dropdown-menu drop-design" aria-labelledby="dropdownMenuLink">
                                        <div class="dropdown-item" data-toggle="modal" data-target="#deleteReplyModal-${data.data.replyID}">
                                            Delete <i class="fas fa-times" ></i> 
                                        </div> 
                                        <a class="dropdown-item update-reply-button" href="/comments/update-reply/${ data.data.replyID }" >Edit <i class="fas fa-pen-square"></i></a>
                                        <a class="dropdown-item reply-reply-button" href="/comments/reply-reply-r1/${data.data.replyID}">Reply <i class="far fa-comment-dots"></i></a>
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
                                
                                    <div class="reply-content" id="reply-${data.data.replyID}-content">
                                            <div class="removetag" id="removetag-${data.data.replyID}">
                                                <a href="/comments/reply-remove-tag/${data.data.replyID }" class="removetag-button">Remove Tag?</a>
                                            </div>
                                        <a href="/users/profile/${data.data.replyContent.originalAuthorID}" onmouseover="removetagVisible(this)" name="${data.data.replyID}" class="authorarrow">
                                              ${data.data.replyContent.originalAuthorName}
                                              <div class="pointarrows">
                                              <div class="circle "></div>
                                              <div class="circle"></div>
                                              <div class="circle"></div>
                                              <div class="circle"></div>
                                              <div class="circle"></div>
                                              
                                              <div class="circle topright" >
                                              </div>
                                              <div class="circle topright2">
                                              </div>
                                              <div class="circle bottomright">
                                              </div>
                                              <div class="circle bottomright2">
                                              </div>
                                          </div>
                                        </a>
                                          <span class="replyreplycontent">  ${ data.data.replyContent.content}</span>
                                    </div>
                                    
                                    </li>`);
                                    $(`#comment-${data.data.commentID}-reply-list`).prepend(newReply);
                                    cSelf.deleteReply($(" .delete-reply-button",newReply));
                                    cSelf.updateReply($(' .update-reply-button', newReply));
                                    cSelf.replyReply1($(' .reply-reply-button', newReply));
                                    cSelf.removeTag($(' .removetag-button', newReply));
                                    new Noty({
                                        theme:"relax",
                                        text:"Reply published successfully!",
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
                    postReplyReply(cSelf);

                },
                error:function(err)
                {
                    console.log(err.responseText);
                    return;
                }
            })
        })
    }

    removeTag(removeTagLink)
    {
        $(removeTagLink).click(function(e){
            e.preventDefault();
            console.log("inside remove tag button ");
            $.ajax({
                type: 'get',
                url: $(removeTagLink).prop('href'),
                success: function(data){
                
                    console.log(data.data,$(`#reply-${data.data.replyID}`));
                    $(`#reply-${data.data.replyID} .reply-content a`).remove();
                    $(`#reply-${data.data.replyID} .reply-content .removetag`).remove();
                    new Noty({
                        theme: 'relax',
                        text: "Removed Tag Successfully!",
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