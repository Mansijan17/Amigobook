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
            <div class="post-likes-number>
                <a href="/likes/toggle/?id=${i._id }&type=Post" data-likes="0" class="toggle-like-button">
                    0 <i class="fas fa-thumbs-up like-thumbs"></i>
                </a>
            </div>
           
            <ul id="post-${i._id}-likes" class="post-like-username-list">
                       
                
            </ul>
            
        </div>

        <div class="content">
            <small>
                <a href="/posts/destroy-post/${ i._id }" class="delete-post-button">Delete Post</a>
            </small>
         
            <p>
                ${ i.content}
                <br>
                <small>${ i.user.name }</small>
            </p>
            <div class="post-comments">
                <form action="/comments/create-comment" method="post" id="post-${ i._id }-comments-form">
                    <input type="text" name="content" placeholder="Type here to add comment...." required>
                    <input type="hidden" name="post" value="${ i._id }">
                    <button type="submit">Add comment</button>
                </form>
            </div>
            <div class="post-comments-list">
                <ul id="post-comments-${i._id}">
                   
                </ul>
        
            </div>
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