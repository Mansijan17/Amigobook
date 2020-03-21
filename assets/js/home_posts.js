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
                    <a href="/posts/destroy-post/${ i.id }" class="delete-post-button">Delete Post</a>
                </small>
         
            <p>
                ${ i.content}
                <small>${ i.user.name }</small>
            </p>
            <div class="post-comments">
                <form action="/comments/create-comment" method="post">
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
    creatPost();
}