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
                method:"post",
                url:"/posts/create-post",
                data:newPostForm.serialize(),
                success:function(data)
                {
                    console.log(data);
                },
                error:function(err)
                {
                    console.log(err.responseText);
                }
            })
        })
    }
    creatPost();

    //method to create post in DOM
}