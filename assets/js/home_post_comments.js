{
   class PostComments
   {
       constructor(postId)
       {
           let postForm=$(`#post-${postId}`);
           let commentForm=$(`#post-${postId}-comments-form`);

           createComment(postId);

           let self=this;
           $(" .delete-comment-button",postForm).each(function()
           {
               self.deleteComment($(this));
           })
       }

       createComment(postId)
       {
           let pself=this;
           commentForm.submit(function(e)
           {
               e.preventDefault();
               $.ajax({
                   type:"post",
                   url:"/comments/create-comment",
                   data:commentForm.serialize(),
                   success:function(data)
                   {
                       let newComment=newCommentDOM(data.data.comment);
                       $(`#post-comments-${postId}`).prepend(newComment);
                       pself.deleteComment($(' .delete-comment-button',newComment));
                       new Noty({
                        theme: 'relax',
                        text: "Comment published!",
                        type: 'success',
                        layout: 'topRight',
                        timeout: 1500
                        
                         }).show();
                   },
                   error:function(err)
                   {
                       console.log(err.responseText);
                   }
               });
           });
       }

       newCommentDOM(comment)
       {
           return $(`<li id="comments-${comment._id}">
                            <small>
                                <a href="/comments/destroy-comment/${comment._id }" class="delete-comment-button">X</a>
                            </small>
                       
                        <p>
                            ${ comment.content }
                            <br>
                            <small>
                                ${ comment.user["name"] }
                            </small>
                        </p>
                    </li>`)
       }

       deleteComment(deletelink)
       {
           $(deletelink).submit(function(e)
           {
               e.preventDefault();
               $.ajax({
                   type:"get",
                   url:$(deletelink).prop("href"),
                   success:function(data)
                   {
                       $(`#comments-${data.data.comment_id}`).remove();
                       new Noty({
                        theme:"relax",
                        text:"Comment deleted!",
                        type:"success",
                        layput:"topRight",
                        timeout:1500
                        }).show();
                   },
                   error:function(err)
                   {
                       console.log(err.responseText);
                   }
               })
           })
       }

   }
}