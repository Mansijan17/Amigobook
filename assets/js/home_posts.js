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
                    deletePost(" .delete-post-button",newPost);

                    //call the create comment class
                    new PostComments(data.data.post._id);

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

        <li style="text-align: left;" id="post-${ i._id}">
           
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