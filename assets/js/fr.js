$(".confirm-friend-button").click(function(e)
{
    e.preventDefault();
    console.log($(".confirm-friend-button"),"confrm");

    $.ajax({
        type:"get",
        url:$(".confirm-friend-button").prop("href"),
        success:function(data)
        {
            console.log(data.data.frID);
            $(`#fr-${data.data.frID}`).remove();
            new Noty({
                theme:"relax",
                text:"Congrats, one more friendship blossomed!",
                type:"success",
                layput:"topRight",
                timeout:1800
            }).show();
        }
    })
})

$(".no-friend-button").click(function(e)
{
    e.preventDefault();
    console.log($(".no-friend-button"),"no");

    $.ajax({
        type:"get",
        url:$(".no-friend-button").prop("href"),
        success:function(data)
        {
            console.log(data.data.frID);
            $(`#fr-${data.data.frID}`).remove();
            new Noty({
                theme:"relax",
                text:"Yeah, maybe timing was not right!",
                type:"success",
                layput:"topRight",
                timeout:1800
            }).show();
        }
    })
})