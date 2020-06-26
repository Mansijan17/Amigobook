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
                type:"get",
                url:$(self).attr("href"),
            }).done(function(data)
            {
                //console.log(data.data);
                let likesCount=parseInt($(self).attr("data-likes"));
                //console.log(likesCount);
                data.data.type=data.data.type.toLowerCase();
                if(data.data.deleted==true)
                {
                    likesCount-=1;
                    if(data.data.type=="commentreply")
                    {
                        $(`#reply-${ data.data.id }-like-toggle`).html(`Like <i class="far fa-thumbs-up"></i>`);
                    }
                    $(`#like-${data.data.likeID}`).remove();
                }
                else
                {
                    likesCount+=1;
                    let newList=$(`<li id="like-${data.data.likeID}"><a href="/users/profile/${data.data.userID}">
                    <span>${data.data.name}</span>
                    </a></li>`)
                    if(data.data.userImage)
                    {
                        $(" a",newList).prepend(`<img src=${data.data.userImage}>`)
                    }
                    else
                    {
                        $(" a",newList).prepend(`<div class="concealed-image" style="background:${data.data.userBgColor}"><span>${ data.data.name.split(" ")[0].charAt(0).toUpperCase()}</span></div>`)
                    }
                    $(`#${data.data.type}-${ data.data.id }-likes-list`).prepend(newList);
                    if(data.data.type=="commentreply")
                    {
                        $(`#reply-${ data.data.id }-like-toggle`).html(`Unlike <i class="far fa-thumbs-up"></i>`);
                    }
                }
                
                $(self).attr("data-likes",likesCount);
                if(likesCount>0)
                {
                    if(data.data.type=="commentreply")
                    {
                        
                        if(likesCount==1)
                        {
                            $(`#${data.data.type}-${ data.data.id}-likes-number span`).html(`${likesCount} Reaction`)
                        }
                        else
                        {
                            $(`#${data.data.type}-${ data.data.id}-likes-number span`).html(`${likesCount} Reactions`)
                        }
                        $(`#${data.data.type}-${ data.data.id}-like-title span`).html(`${likesCount} <i class="far fa-heart"></i>`)
                    }
                    else
                    {
                        $(`#${data.data.type}-${ data.data.id}-likes-number span`).html(`${likesCount}`)
                        $(`#${data.data.type}-${ data.data.id}-like-title span`).html(`${likesCount} <i class="far fa-heart"></i>`)
                    }
                    
                }
                else
                {
                    $(`#${data.data.type}-${ data.data.id}-likes-number span`).html(``);
                    $(`#${data.data.type}-${ data.data.id}-like-title span`).html(` <i class="far fa-heart"></i>`);
                }
                
                

            }).fail(function(err)
            {
                console.log('error in completing the request ',err);
            });
        });
    }
}