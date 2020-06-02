let pendingFrom=function()
{
    console.log($(".add-friend-button"));
    $(".add-friend-button").click(function(e)
    {
        console.log($(".add-friend-button"));
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".add-friend-button").prop("href"),
            success:function(data)
            {
                console.log(data.data);
                $(".add-friend-button").remove();
                $(".add-chat-friend-group").prepend(`
                <span class="pending-from">Friend Request Pending</span>
                        <a href="/users/friends-cancel-form/?from=${data.data.from}&to=${data.data.to}" class="cancel-friend-button">
                            Want to cancel it?
                 </a>`);
                 cancelPendingForm();
                 new Noty({
                    theme:"relax",
                    text:"Friend Request Sent Successfully!",
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
pendingFrom()
let cancelPendingForm=function()
{
    console.log($(".cancel-friend-button"));
    $(".cancel-friend-button").click(function(e)
    {
        console.log($(".cancel-friend-button"));
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".cancel-friend-button").prop("href"),
            success:function(data)
            {
                console.log(data.data);
                $(".cancel-friend-button").remove();
                $(".pending-from").remove();
                $(".add-chat-friend-group").prepend(`
                <a href="/users/friends-pending-form/?from=${data.data.to}&to=${data.data.from}" class="add-friend-button">
                Add Friend
                </a>`);
                pendingFrom();
                 new Noty({
                    theme:"relax",
                    text:"Friend Request Cancelled Successfully!",
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
cancelPendingForm();
let noFriendshipAnswer=function()
{
    console.log($(".no-friend-button"));
    $(".no-friend-button").click(function(e)
    {
        console.log($(".no-friend-button"));
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".no-friend-button").prop("href"),
            success:function(data)
            {
                console.log(data.data);
                $(".pending-form-options").remove();
                $(".pending-form-present").remove();
                $(".add-chat-friend-group").prepend(`
                <a href="/users/friends-pending-form/?from=${data.data.from}&to=${data.data.to}" class="add-friend-button">
                Add Friend
                </a>`);
                pendingFrom();
                 new Noty({
                    theme:"relax",
                    text:"Friend Request Cancelled Successfully!",
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
noFriendshipAnswer();
let confirmFriendshipAnswer=function()
{
    console.log($(".confirm-friend-button"));
    $(".confirm-friend-button").click(function(e)
    {
        console.log($(".confirm-friend-button"));
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".confirm-friend-button").prop("href"),
            success:function(data)
            {
                console.log(data.data);
                $(".pending-form-options").remove();
                $(".pending-form-present").remove();
                let newFriend=$(`<a href="/users/destroy-friends/?from=${data.data.to}&to=${data.data.from}" class="remove-friend-button">
                Remove Friend
                </a>`)
                $(".add-chat-friend-group").prepend(newFriend);
                destroyFriendshipAnswer(newFriend);
                 new Noty({
                    theme:"relax",
                    text:"Congrats, you are buddies!",
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
confirmFriendshipAnswer()

let destroyFriendshipAnswer=function(removeButton)
{
    console.log($(removeButton));
    $(removeButton).click(function(e)
    {
        console.log($(removeButton));
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(removeButton).prop("href"),
            success:function(data)
            {
                console.log(data.data);
                $(".add-chat-friend-group .remove-friend-button").remove();
                $(".add-chat-friend-group").prepend(`
                <a href="/users/friends-pending-form/?from=${data.data.from}&to=${data.data.to}" class="add-friend-button">
                Add Friend
                </a>`);
                pendingFrom();
                 new Noty({
                    theme:"relax",
                    text:"Hope to see you guys back!",
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

$(".remove-friend-button").each(function()
{
    let self=$(this);
    destroyFriendshipAnswer(self);
})


