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
            console.log("del comments");
        });
        $(' .update-comment-button', this.postContainer).each(function(){
            self.updateComment($(this));
            console.log("updating comments");
        });
        $(' .comment-update-form', this.postContainer).each(function(){
            self.updateCommentContent($(this));
            console.log("updating comment contents");
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
                    if(!data.data.comment.user.avatar)
                    {
                        if(data.data.comment.user.gender=="male")
                        {
                            //console.log("m");
                            commentData.imageURL="https://i.stack.imgur.com/HQwHI.jpg";
                        }
                        else
                        {
                            commentData.imageURL="/images/femaleProfile.png";
                        }
                    }
                    else
                    {
                        commentData.imageURL=data.data.comment.user.avatar;
                    }
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
                    $(`#post-comments-${postId}`).prepend(newComment);
                    let commentsCount=parseInt($(`#post-${postId}-comment-number`).attr("data-comments"));
                    commentsCount+=1;
                    $(`#post-${postId}-comment-number`).attr("data-comments",commentsCount);
                    
                    
                        $(`#post-${postId}-comment-number`).attr("data-toggle","collapse");
                        $(`#post-${postId}-comment-number`).html(`<span>${commentsCount}</span> <i class="fas fa-comments"></i>`);
                    
                    
                  
                    pSelf.deleteComment($(' .delete-comment-button', newComment));
                    pSelf.updateComment($(' .update-comment-button', newComment));
   
                    new ToggleLike($(" .toggle-like-button", newComment));
                    new Noty({
                        theme: 'relax',
                        text: "Comment published!",
                        type: 'success',
                        layout: 'topRight',
                        timeout: 1500
                        
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
        <small> 
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
                    <img src="${comment.imageURL}">
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
            console.log("inside delte button ");
            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data){
                
                    console.log("remove comment: ",data.data);
                    $(`#comment-${data.data.comment_id}`).remove();
                    let commentsCount=parseInt($(`#post-${data.data.postID}-comment-number`).attr("data-comments"));
                    console.log(commentsCount);
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
                    console.log(data.data);
                   
                    $(`#comment-${ data.data.commentID}-content div .comment-text > span`).remove();
                    $(`#comment-${ data.data.commentID}-content div .comment-text`).append(`<form action="/comments/update-comment-c2" method="post" class="comment-update-form">
                    <textarea required  name="content" >${ data.data.content}</textarea>
                    <input type="hidden" name="comment" value="${ data.data.commentID}">
                    <button type="submit">U</button>
                    </form>`)
                    
                    
                    let updateCommentContent=function()
                    {
                        
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
                                    
                                    $(`#comment-${data.data.commentID}-content .comment-text form`).remove();
                                    $(`#comment-${data.data.commentID}-content .comment-text `).prepend(`<span>${data.data.content}</span>`);
                                    $(`#comment-${data.data.commentID}-reply-content`).html(`${data.data.content}`);
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

                    updateCommentContent();
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
        console.log("h1",$(form));
        $(form).submit(function(e)
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
                    
                    $(`#comment-${data.data.commentID}-content .comment-text form`).remove();
                    $(`#comment-${data.data.commentID}-content .comment-text `).prepend(`<span>${data.data.content}</span>`);
                    $(`#comment-${data.data.commentID}-reply-content`).html(`${data.data.content}`);
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