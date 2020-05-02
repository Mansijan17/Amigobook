class SharePost{
    constructor(toggleElement)
    {
        this.toggler=toggleElement;
        //console.log("share c ");
        this.postShare();
    }

    postShare()
    {
        //console.log("share f 1");
        let newSharePostForm=$(this.toggler);
        //console.log(newSharePostForm);
        newSharePostForm.submit(function(e)
        {
            console.log("share f 2");
            e.preventDefault();
            $.ajax({
                type:"post",
                url:newSharePostForm.prop("action"),
                data:newSharePostForm.serialize()
            }).done(function(data)
            {
                console.log(data.data);
                let sharesCount=parseInt(newSharePostForm.attr("data-shares"));
                console.log(sharesCount);
                sharesCount+=1;
                $(`#post-${ data.data.originalPostID }-shares-list`).prepend(`<li id="share-${data.data.shareID}"><a href="/users/profile/${data.data.userID}">
                            <img src=${data.data.userImage}>
                            <span>${data.data.name}</span>
                            </a></li>`) 
                   
                
                newSharePostForm.attr("data-shares",sharesCount);
                $(`#post-${ data.data.originalPostID}-shares-number .post-shares-no-display`).html(`${sharesCount}`);
                new Noty({
                    theme:"relax",
                    text:"Post shared!",
                    type:"success",
                    layput:"topRight",
                    timeout:1500
                }).show();

                

            }).fail(function(err)
            {
                console.log('error in completing the request ',err);
            });
        });
    }
}