// Let's implement this via classes

// this class would be initialized for every post on the page
// 1. When the page loads
// 2. Creation of every post dynamically via AJAX

class PostComments{
    // constructor is used to initialize the instance of the class whenever a new instance is created
    constructor(postId){
        this.postId = postId;
        this.postContainer = $(`#post-${postId}`);
        this.newCommentForm = $(`#post-${postId}-comments-form`);

        this.createComment(postId);

        let self = this;
        // call for all the existing comments
        $(' .delete-comment-button', this.postContainer).each(function(){
            self.deleteComment($(this));
           // console.log("del comments");
        });
        $(' .update-comment-button', this.postContainer).each(function(){
            self.updateComment($(this));
           // console.log("updating comments");
        });
      
    }


    createComment(postId){
        let pSelf = this;
        this.newCommentForm.submit(function(e){
            e.preventDefault();
            let self = this;
            $.ajax({
                type: 'post',
                url: '/comments/create-comment',
                data: $(self).serialize(),
                success: function(data){
                    //console.log("creating comment ",data.data);
                    let commentData=data.data.comment;
                    //console.log(data.data.comment.user._id,data.data.post.user._id);
                    if(data.data.comment.user._id==data.data.post.user._id)
                    {
                        //console.log("match");
                        commentData.authorTag="author-tag";
                        commentData.author="Author"
                    }
                    else
                    {
                        //console.log("unmatch");
                        commentData.authorTag="";
                        commentData.author="";
                    }
                    var ts=new Date(data.data.comment.createdAt);
                    commentData.createdAt=ts.toLocaleString();
                    //console.log(commentData);
                    let newComment = pSelf.newCommentDom(commentData);
                    if(!data.data.comment.user.avatar)
                    {
                        $(" .author-comment-name a",newComment).prepend(`<div class="concealed-image" style="background:${data.data.comment.user.info.bgColor}"><span>${data.data.comment.user.name.split(" ")[0].charAt(0)}</span></div>`)
                    }
                    else
                    {
                        $(" .author-comment-name a",newComment).prepend(`<img src=${data.data.comment.user.avatar}>`)
                    }
                    $(`#post-comments-${postId}`).prepend(newComment);
                    let commentsCount=parseInt($(`#post-${postId}-comment-number`).attr("data-comments"));
                    commentsCount+=1;
                    $(`#post-${postId}-comment-number`).attr("data-comments",commentsCount);
                    $(`#post-${postId}-comment-number`).attr("data-toggle","collapse");
                    $(`#post-${postId}-comment-number`).html(`<span>${commentsCount}</span> <i class="fas fa-comments"></i>`);
                    // if(data.data.notyOriginalUser.noties.length!=0)
                    // {
                    //     if(data.data.notyOriginalUser.prevNotyOpen)
                    //     {
                    //         if(data.data.notyOriginalUser.noties.length-data.data.notyOriginalUser.oldNotyLength!=0)
                    //         {
                    //             $(`#noty-ball${data.data.notyOriginalUser._id} i`).append(`  <div class="noty-bell-no">
                    //             ${data.data.notyOriginalUser.noties.length-data.data.notyOriginalUser.oldNotyLength}
                    //             </div>`)
                    //         }
                    //     }
                    //     else
                    //     {
                    //         $(`#noty-ball${data.data.notyOriginalUser._id} i`).append(`  <div class="noty-bell-no">
                    //         ${data.data.notyOriginalUser.noties.length}
                    //         </div>`)
                    //     }
                    // }
                    
                  
                    pSelf.deleteComment($(' .delete-comment-button', newComment));
                    pSelf.updateComment($(' .update-comment-button', newComment));
   
                    new ToggleLike($(" .toggle-like-button", newComment));
                    new Noty({
                        theme: 'relax',
                        text: "Congrats, now you are the parent of this baby!",
                        type: 'success',
                        layout: 'topRight',
                        timeout: 1800
                        
                    }).show();

                }, error: function(error){
                    console.log(error.responseText);
                }
            });


        });
    }


    newCommentDom(comment){
        // I've added a class 'delete-comment-button' to the delete comment link and also id to the comment's li
        return $(`<li id="comment-${ comment._id }" class="comment-list">

        <div class="comment-like-box">
                <div class="comment-likes-number" id="comment-${comment._id }-likes-number">
                    <span data-target="#comment-${ comment._id }-likes" data-toggle="modal"></span>
                    <a class="toggle-like-button" href="/likes/toggle/?id=${comment._id}&type=Comment" data-likes="0">
                        <i class="fas fa-thumbs-up like-thumbs"></i>
                    </a>
                </div>

                <div class="modal fade" id="comment-${ comment._id}-likes" role="dialog">
                    <div class="modal-dialog">
                    
                    <!-- Modal content-->
                    <div class="modal-content">
                        <div class="modal-header">
                        <h4 class="modal-title" id="comment-${comment._id}-like-title">Comment Reactions  
                        <span>
                       
                        <i class="far fa-heart"></i>
                      </span></h4>
                        </div>
                        <div class="modal-body">
                            
                            <ul  class="comment-like-username-list " id="comment-${comment._id }-likes-list">
                                    
                            </ul>
                        
                        </div>
                    
                    </div>
                    
                    </div>
            </div>

                    
        </div>
        <small class="comment-deletion">
        <span data-toggle="modal" data-target="#deleteCommentModal-${comment._id}" class="delete-comment-modal">
        <i class="fas fa-times"></i>
    </span>
    <div class="modal fade deletecommentmodal" tabindex="-1" role="dialog" id="deleteCommentModal-${comment._id}" style="padding-right:0px;" >
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title"><i class="fas fa-trash-alt"></i> Comment?</h2>
            </div>
            <div class="modal-body">
            <p style="text-align:left;">Are you sure you want to delete it? All the likes and replies will be lost forever.</p>
            </div>
            <div class="modal-footer">
              <a href="/comments/destroy-comment/${comment._id }" class="delete-comment-button btn btn-danger" data-dismiss="modal">Remove</a>
              <button type="button" class="btn btn-light" data-dismiss="modal">Discard</button>
            </div>
          </div>
        </div>
      </div>
        </small>
        <small class="updatecommenttag"> 
            <a href="/comments/update-comment/${comment._id }" class="update-comment-button" >
                <i class="fas fa-marker"></i>
            </a>
        </small>
        <div class="comment-content" id="comment-${comment._id}-content">    
                           
            <div>    
                <span class="comment-text"><span>${comment.content}</span></span>
                <br>
                <small class="author-comment-name">
                <a href="/users/profile/${comment.user._id }">
                    
                    ${comment.user.name}<span class="${comment.authorTag}" style="width:45px;"> ${comment.author}</span>
                </a>
                </small>
                <br>
                <span class="comment-timestamps">
                        ${ comment.createdAt }
                </span>
            </div> 
        </div>   
        <a class="comment-reply" href="/comments/replies/${comment._id}">
            <i class="fas fa-reply-all" title="View Replies" data-placement="top" data-toggle="tooltip"></i>
        </a>
    </li>`);
    }


    deleteComment(deleteLink){
        $(deleteLink).click(function(e){
            e.preventDefault();
            //console.log("inside delte button ");
            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data){
                
                    //console.log("remove comment: ");
                    
                    $(`#comment-${data.data.comment_id}`).remove();

                    let commentsCount=parseInt($(`#post-${data.data.postID}-comment-number`).attr("data-comments"));
                    //console.log(commentsCount);
                    commentsCount-=1;
                    $(`#post-${data.data.postID}-comment-number`).attr("data-comments",commentsCount);
                    if(commentsCount>0)
                    {
                        $(`#post-${data.data.postID}-comment-number`).attr("data-toggle","collapse");
                        $(`#post-${data.data.postID}-comment-number`).html(`<span>${commentsCount}</span> <i class="fas fa-comments"></i>`);
                    }
                    else
                    {
                        $(`#post-${data.data.postID}-comment-number`).removeAttr("data-toggle");
                        $(`#post-${data.data.postID}-comment-number`).html(`<span></span> <i class="fas fa-comments"></i>`);
                    }
                    $('.modal-backdrop').remove();
                    $('body').removeClass( "modal-open" );
                    new Noty({
                        theme: 'relax',
                        text: "See you, till the next time!",
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

    updateComment(updateLink)
    {
        
        $(updateLink).click(function(e)
        {
          
            e.preventDefault();
            $.ajax({
                type:"get",
                url:$(updateLink).prop("href"),
                success:function(data)
                {
                    //console.log(data.data);
                    $(`.post-comments-list>ul>li`).each(function()
                    {
                        let self=$(this);
                        let button=$(" .updatecommenttag",self);
                        let i=$(" .update-comment-button",button)
                        i.css("pointer-events","none");
                        button.css("cursor","no-drop");

                    });
                    $(`#comment-${ data.data.commentID} .comment-deletion`).css("cursor","no-drop");
                    $(`#comment-${ data.data.commentID} .comment-deletion span`).css("pointer-events","none");
                    $(`.post-comments>form`).each(function()
                    {
                        let self=$(this);
                        self.css("cursor","no-drop");
                        let button=$(" button",self);
                        button.css("pointer-events","none");
                    })
                   
                    $(`#comment-${ data.data.commentID}-content > div .comment-text`).remove();
                    $(`#comment-${ data.data.commentID}-content > div`).prepend(`<span class="comment-text" style="width:100%"><form action="/comments/update-comment-c2" method="post" class="comment-update-form">
                    <textarea required  name="content" onkeydown="autosize1(this)">${ data.data.content}</textarea>
                    <input type="hidden" name="comment" value="${ data.data.commentID}">
                    <button type="submit">U</button>
                    </form></span>`)
                    
                    
                    let updateCommentContent=function()
                    {
                        
                        $(".comment-update-form").submit(function(e)
                        {
                            //console.log("h2");
                            e.preventDefault();
                            $.ajax({
                                type:"post",
                                url:"/comments/update-comment-c2",
                                data:$(".comment-update-form").serialize(),
                                success:function(data)
                                {
                                    //console.log(data.data);
                                    $(`.post-comments-list>ul>li`).each(function()
                                    {
                                        let self=$(this);
                                        
                                        let button=$(" .updatecommenttag",self);
                                        
                                        let i=$(" .update-comment-button",button)
                                    
                                        i.css("pointer-events","auto");
                                        button.css("cursor","pointer");

                                    });
                                    $(`.post-comments>form`).each(function()
                                    {
                                        let self=$(this);
                                        self.css("cursor","pointer");
                                        let button=$(" button",self);
                                        button.css("pointer-events","auto");
                                    })
                                    $(`#comment-${ data.data.commentID} .comment-deletion`).css("cursor","pointer");
                                    $(`#comment-${ data.data.commentID} .comment-deletion span`).css("pointer-events","auto");
                                    if(data.data.edited)
                                    {
                                            $(`#comment-${data.data.commentID}`).prepend(`<small class="comment-editedTag">
                                        Edited
                                        </small>`);
                                    }
                                    
                                    $(`#comment-${data.data.commentID}-content .comment-text form`).remove();
                                    $(`#comment-${data.data.commentID}-content .comment-text`).css("width","80%");
                                    $(`#comment-${data.data.commentID}-content .comment-text`).prepend(`<span>${data.data.content}</span>`);
                                    $(`#comment-${data.data.commentID}-reply-content`).html(`${data.data.content}`);
                                    new Noty({
                                        theme:"relax",
                                        text:"This comment had a successful affair of words!",
                                        type:"success",
                                        layput:"topRight",
                                        timeout:1800
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

                    updateCommentContent();
                },
                error:function(err)
                {
                    console.log("error ",err.responseText);
                }
            })
        })
    }
}