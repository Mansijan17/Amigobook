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
                    $(`#post-${postId}-comment-number`).html(`${commentsCount} <i class="fas fa-comments"></i>`);
                  
                    pSelf.deleteComment($(' .delete-comment-button', newComment));
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
                    <span data-target="#comment-${ comment._id }-likes" data-toggle="modal">0</span>
                    <a class="toggle-like-button" href="/likes/toggle/?id=${comment._id}&type=Comment" data-likes="0">
                        <i class="fas fa-thumbs-up like-thumbs"></i>
                    </a>
                </div>

                <div class="modal fade" id="comment-${ comment._id}-likes" role="dialog">
                    <div class="modal-dialog">
                    
                    <!-- Modal content-->
                    <div class="modal-content">
                        <div class="modal-header">
                        <h4 class="modal-title">Comment Reactions  
                            <br></i></h4>
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
            <a class="delete-comment-button" href="/comments/destroy-comment/${comment._id}">
                <i class="fas fa-times"></i>
            </a>
        </small>
        <div class="content">    
                           
            <p>    
                ${comment.content}
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
            </p> 
        </div>   

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
                
                    console.log("remove comment: ",data);
                    $(`#comment-${data.data.comment_id}`).remove();
                    let commentsCount=parseInt($(`#post-${data.data.postID}-comment-number`).attr("data-comments"));
                    console.log(commentsCount);
                    commentsCount-=1;
                    $(`#post-${data.data.postID}-comment-number`).attr("data-comments",commentsCount);
                    $(`#post-${data.data.postID}-comment-number`).html(`${commentsCount} <i class="fas fa-comments"></i>`);
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