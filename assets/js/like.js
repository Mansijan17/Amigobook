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
                let likesCount=parseInt($(self).attr("data-likes"));
                console.log(likesCount);
                if(data.data.deleted==true)
                {
                    likesCount-=1;
                }
                else
                {
                    likesCount+=1;
                }
                $(self).attr("data-likes",likesCount);
                $(self).html(`${likesCount} <i class="fas fa-thumbs-up like-thumbs"></i>`);
            }).fail(function(err)
            {
                console.log('error in completing the request ',err);
            });
        });
    }
}