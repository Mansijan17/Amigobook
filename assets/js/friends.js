let pendingFrom=function(){

    $(".add-friend-button").click(function(e)
    {
       
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".add-friend-button").prop("href"),
            success:function(data)
            {
                //console.log(data.data);
                $(".add-friend-button").remove();
                $(".add-chat-friend-group").prepend(`
                <span class="pending-from">Friend Request Pending</span>
                        <a href="/users/friends-cancel-form-from/?to=${data.data.to}" class="cancel-friend-button">
                            Want to cancel it?
                 </a>`);
                 cancelPendingForm();
                 new Noty({
                    theme:"relax",
                    text:"The ball is now on the other side!",
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

    $(".cancel-friend-button").click(function(e)
    {

        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".cancel-friend-button").prop("href"),
            success:function(data)
            {
               // console.log(data.data);
                $(".cancel-friend-button").remove();
                $(".pending-from").remove();
                $(".add-chat-friend-group").prepend(`
                <a href="/users/friends-pending-form/?to=${data.data.to}" class="add-friend-button">
                Add Friend
                </a>`);
                pendingFrom();
                 new Noty({
                    theme:"relax",
                    text:"Yes, maybe this was not the right moment!",
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
    console.log("no")
    $(".no-friend-button").click(function(e)
    {
        console.log("no hi");
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".no-friend-button").prop("href"),
            success:function(data)
            {
                console.log("no hi 2");
                $(".pending-form-options").remove();
                $(".pending-form-present").remove();
                $(".add-chat-friend-group").prepend(`
                <a href="/users/friends-pending-form/?to=${data.data.from}" class="add-friend-button">
                Add Friend
                </a>`);
                pendingFrom();
                 new Noty({
                    theme:"relax",
                    text:"Yes, maybe this was not the right moment!",
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

    $(".confirm-friend-button").click(function(e)
    {

        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(".confirm-friend-button").prop("href"),
            success:function(data)
            {
                //console.log(data.data);
                $(".pending-form-options").remove();
                $(".pending-form-present").remove();
                let newFriend=$(`<div data-toggle="modal" data-target="#removeFriendModal" class="remove-friend-button-1">
                    Remove Friend
                </div>`);
                $("main").append(` <div class="modal fade remove-friend-warning" id="removeFriendModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="removeFriendModalLabel"><i class="fas fa-trash-alt"></i> Buddy?</h5>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to remove <b>${data.data.name}</b> from your sky? </p>
                    </div>
                    <div class="modal-footer">
                        <a href="/users/destroy-friends/false/?to=${data.data.from}" class="btn btn-primary remove-friend-button">
                                Remove Friend
                        </a>
                        <button type="button" class="btn discard-friend" data-dismiss="modal">Discard</button>
                    </div>
                  </div>
                </div>
              </div>`)
                $(".add-chat-friend-group").prepend(newFriend);

                if(data.data.length==1)
                {
                    $(`#collapseOne .card-body > div`).remove();
                    $(`#collapseOne .card-body`).append(`<p  data-toggle="modal" data-target="#friendModal" style="cursor: pointer;" class="normal-connections">
                       1 Connection 
                    </p>`);
                    $("body").append(`<div class="modal fade" id="friendModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                            <h2 class="modal-title" id="exampleModalLabel">
                              1 Connection 
                            </h2>
                            </div>
                            <div class="modal-body">
                                    <ul>
                                       
                                    </ul>
                            </div>
                            
                        </div>
                        </div>
                    </div>`)
                }
                else
                {
                    $(`#collapseOne .card-body .normal-connections`).html(`${data.data.length} Connections`);
                    $(`#friendModal .modal-title`).html(`${data.data.length} Connections`)
                }
                let newList=$(`<li id="user-${data.data.to}" class="friend-list">
                    <a href="/users/profile/${data.data.to}">
                        <span>${data.data.friendName}</span>
                    </a>
                </li>`)
                if(data.data.img)
                {
                    $(" a",newList).prepend(`<img src=${data.data.img}>`)
                }
                else
                {
                    $(" a",newList).prepend(`<div class="concealed-image" style="background:${data.data.bgColor};"><span>${data.data.friendName.split(" ")[0].charAt(0).toUpperCase()}</span></div>`)
                }
                $(`#friendModal .modal-body ul`).prepend(newList);
                destroyFriendshipAnswer($("main .remove-friend-warning .remove-friend-button"));
                 new Noty({
                    theme:"relax",
                    text:"Congrats, one more friendship blossomed!",
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

    $(removeButton).click(function(e)
    {

        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(removeButton).prop("href"),
            success:function(data)
            {
                //console.log(data.data);
                
                if(data.data.length>0)
                {
                    if(data.data.length==1)
                    {
                        $(`#friendModal .modal-title`).html(`${data.data.length} Connection`);
                        $(`#collapseOne .normal-connections`).html(`${data.data.length} Connection`)
                    }
                    else
                    {
                        $(`#friendModal .modal-title`).html(`${data.data.length} Connections`)
                        $(`#collapseOne .normal-connections`).html(`${data.data.length} Connections`)
                    }
                }
                else
                {
                    $(`#friendModal`).modal('hide');
                    $(`#friendModal`).remove();
                    $(`#collapseOne .card-body p`).remove();
                    if(data.data.loggedUserPage)
                    {
                        $(`#collapseOne .card-body`).append(`<div>Are you ready for it?</div>`);
                        $("body .delete-friend-warning").remove();
                    }
                    else
                    {
                        $(`#collapseOne .card-body`).append(`<div>Well, Looks like you have to make the first move xD!</div>`);
                    }
                   
                }
                $('.modal-backdrop').remove();
                $('body').removeClass( "modal-open" );
                if(data.data.loggedUserPage)
                {
                    $(`#deleteFriendModal-${data.data.to}`).modal('hide');
                    $(`#deleteFriendModal-${data.data.to}`).remove();
                    $(`#friendModal .modal-body ul #user-${data.data.to}`).remove();
                }
                else
                {
                    $(".add-chat-friend-group .remove-friend-button-1").remove();
                    $(`main .remove-friend-warning`).modal('hide');
                    $("main .remove-friend-warning").remove();
                    $(".add-chat-friend-group").prepend(`
                    <a href="/users/friends-pending-form/?to=${data.data.to}" class="add-friend-button">
                    Add Friend
                    </a>`);
                    pendingFrom();
                    $(`#friendModal .modal-body ul #user-${data.data.from}`).remove();
                }
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


