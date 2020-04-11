class ToggleFriend
{
    constructor(toggleElement)
    {
        this.friend=toggleElement;
        console.log("constructor ",this.friend);
        this.toggleFriend();
    }

    toggleFriend()
    {
        $(this.friend).submit(function(event)
        {
            event.preventDefault();
            let self=this;
            console.log($(self).prop("action"));
            $.ajax({
                type:"post",
                url:$(self).prop("action"),
                data:$(self).serialize(),
                success:function(data)
                {
                    console.log(data.data);

                },
                error:function(err)
                {
                    console.log(err.responseText);
                }
            });
        });
    }
}