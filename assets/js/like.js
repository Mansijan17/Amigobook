class ToggleLike{
    constructor(toggleElement)
    {
        this.toggler=toggleElement;
        this.toggleLike();
    }

    toggleLike()
    {
        $(this.toggler).click(function(e)
        {
            e.preventDefault();
            let self=this;

            $.ajax({
                type:"post",
                url:$(self).attr("href"),
            }).done(function(data)
            {
                console.log(data.data);
                let likesCount=parseInt($(self).attr("data-likes"));
                console.log(likesCount);
                if(data.data.deleted==true)
                {
                    likesCount-=1;
                    if(data.data.type=="Post")
                    {
                        console.log("post delete like");
                        $(`#like-${data.data.likeID}`).remove();

                    }
                    

                }
                else
                {
                    likesCount+=1;
                    if(data.data.type=="Post")
                    {
                        console.log("post accept like");
                        $(`#post-${data.data.id}-likes`).append(`<li id="like-${data.data.likeID}"><a href="/users/profile/${data.data.userID}">${data.data.name}</a></li>`)
                    }
                }
                $(self).attr("data-likes",likesCount);
                if(data.data.type=="Post")
                {
                   // $(`#post-${data.data.id}-likes-number`).remove();
                    // $(`#post-${data.data.id}-likes-number`).html(`${likesCount}
                    // <a class="toggle-like-button" href="/likes/toggle/?id=${data.data.id}&type=Post" data-likes="${likesCount}">
                    //     <i class="fas fa-thumbs-up like-thumbs"></i>
                    // </a></div>`)
                }
                $(self).html(`${likesCount} <i class="fas fa-thumbs-up like-thumbs"></i>`)
            }).fail(function(err)
            {
                console.log('error in completing the request ',err);
            });
        });
    }
}