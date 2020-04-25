{
    //console.log("hello");

    //method to submit the form data for new post using ajax
    let creatPost=function()
    {
        let newPostForm=$("#new-post-form");
        newPostForm.submit(function(e)
        {
            e.preventDefault();

            $.ajax({
                type:"post",
                url:"/posts/create-post",
                data:newPostForm.serialize(),
                success:function(data)
                {
                    //console.log(data.data.post);
                    let newPost=newDomPost(data.data.post);
                    $("#posts-list-container>ul").prepend(newPost);
                    deletePost($(" .delete-post-button",newPost));

                    //call the create comment class
                    new PostComments(data.data.post._id);
                    new ToggleLike($(" .toggle-like-button", newPost));

                    new Noty({
                        theme:"relax",
                        text:"Post published!",
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
    

    //method to create post in DOM
    let newDomPost=function(i)
    {
        return $(`

        <li class="post-list animated-box in" id="post-${ i._id}">
           
        <div class="post-like-box">
            <div class="post-likes-number" id="post-${ i._id }-likes-number">
                <span data-target="#post-${i._id }-likes" data-toggle="modal">0</span>
                <a class="toggle-like-button" href="/likes/toggle/?id=${i._id}&type=Post" data-likes="0">
                    <i class="fas fa-thumbs-up like-thumbs"></i>
                </a>
            </div>
            <div class="modal fade" id="post-${ i.id }-likes" role="dialog">
                <div class="modal-dialog">
                
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                    <h4 class="modal-title" id="#post-${i._id}-title">Post Reactions  
                        <br></i></h4>
                    </div>
                    <div class="modal-body">
                        <ul  class="post-like-username-list" id="post-${ i._id }-likes-list">
                            
                    
                        </ul>
                    </div>
                
                </div>
                
                </div>
          </div>
   
    
        </div>
        
        <small> 
        <a href="/posts/destroy-post/${ i._id }" class="delete-post-button">
            <i class="fas fa-trash-alt"></i>
        </a>
        </small>
        <small class="author-post-name">
            <a href="/users/profile/${i.user._id}">
                <img src="${ i.user.avatar}"> 
                <span>${i.user.name }</span>
            </a>
        </small>

        <div class="content">
         
            <p>
                ${ i.content}
            </p>
            <div class="post-comments">
                <form action="/comments/create-comment" method="post" id="post-${ i._id }-comments-form">
                    <input type="text" name="content" placeholder="Type here to add comment...." required>
                    <input type="hidden" name="post" value="${ i._id }">
                    <button type="submit">Add comment</button>
                </form>
                <div class="post-comment-number" id="post-${ i._id}-comment-number" data-comments="0" data-target="#post-comments-${i._id}-list" data-toggle="collapse" >
                <span >
                    <%= i.comments.length %> 
                </span>
                <i class="fas fa-comments"></i>
            </div>
            </div>
            <div class="post-comments-list collapse">
                <ul id="post-comments-${i._id}">
                   
                </ul>
        
            </div>
        </div>
            <div class="post-timestamps">
                 ${ i.createdAt.toLocaleString() }
            </div>
        </li>`);
    }

    let deletePost=function(deletelink)
    {
        $(deletelink).click(function(e)
        {
            e.preventDefault();
            $.ajax({
                type:"get",
                url:$(deletelink).prop("href"),
                success:function(data)
                {
                    console.log(data.data);
                    $(`#post-${data.data.post_id}`).remove();
                    new Noty({
                        theme:"relax",
                        text:"Post and associated comments are deleted!",
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
   

    //convert posts to ajax
    let postsToAjax=function()
    {
        console.log("converting posts to ajax ");
        $("#posts-list-container>ul>li").each(function()
        {
            let self=$(this);
            let deleteButton=$(" .delete-post-button",self);
            deletePost(deleteButton);

            let postId=self.prop("id").split("-")[1];
            new PostComments(postId)
        })
    }
    creatPost();
    postsToAjax();
}