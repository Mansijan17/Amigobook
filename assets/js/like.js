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
                //console.log(data.data);
                let likesCount=parseInt($(self).attr("data-likes"));
               // console.log(likesCount);
                data.data.type=data.data.type.toLowerCase();
                if(data.data.deleted==true)
                {
                    likesCount-=1;
                    $(`#like-${data.data.likeID}`).remove();
                }
                else
                {
                    likesCount+=1;
                    $(`#${data.data.type}-${ data.data.id }-likes-list`).prepend(`<li id="like-${data.data.likeID}"><a href="/users/profile/${data.data.userID}">
                            <img src=${data.data.userImage}>
                            <span>${data.data.name}</span>
                            </a></li>`)  
                }
                $(self).attr("data-likes",likesCount);
                $(`#${data.data.type}-${ data.data.id}-likes-number span`).html(`${likesCount}`)
                

            }).fail(function(err)
            {
                console.log('error in completing the request ',err);
            });
        });
    }
}