function addWorkCheckBox(modal)
{
    let checkbox =$(" .checkbox input",modal);
    console.log("hi",checkbox,modal)
    checkbox.click(function()
    {
        if($(this).prop("checked")==true)
        {
            $(".to-date").html(`Present`)
        }
        else if($(this).prop("checked")==false)
        {
            $(".to-date").html(`<input type="number" name="toMonth" required placeholder="01">
            <input type="number" name="toYear" required placeholder="2020">`)
        }
    })
    
}
addWorkCheckBox($("#addWorkFormModal"))

function addWorkCheckBox1(work)
{
    let modal=$(`#workUpdateModal-${work._id}`)
    let checkbox =$(" .checkbox input",modal);
    console.log("hi",checkbox,modal)
    checkbox.click(function()
    {
        if($(this).prop("checked")==true)
        {
            $(".to-date").html(`Present`)
        }
        else if($(this).prop("checked")==false)
        {
            if(!work.toMonth)
            {
                $(".to-date").html(`<input type="number" name="toMonth" required placeholder="01">
                <input type="number" name="toYear" required placeholder="2020">`)
            }
            else
            {
                $(".to-date").html(`<input type="number" name="toMonth" required value=${work.toMonth}>
                <input type="number" name="toYear" required value=${work.toYear}>`)
            }
        }
    })
    
}

let addWorkFunction=function()
{
    console.log($("#addWorkFormModal form"));
    $("#addWorkFormModal form").submit(function(e)
    {
        e.preventDefault();
        $.ajax({
            type:"post",
            url:$("#addWorkFormModal form").prop("action"),
            data:$("#addWorkFormModal form").serialize(),
            success:function(data)
            {
                console.log(data);
                if(data.error)
                {
                    new Noty({
                        theme:"relax",
                        text:`${data.message}`,
                        type:"error",
                        layput:"topRight",
                        timeout:1800
                    }).show();
                }
                else
                {
                    
                    $(`#addWorkFormModal`).modal('hide');
                    $('.modal-backdrop').remove();
                    $('body').removeClass( "modal-open" );
                    if(data.data.length==1)
                    {
                        console.log("1",$(".profile-intro .first .accordion #collapseTwo"),$("body"));
                        $(".profile-intro .first .accordion #collapseTwo .card-body").prepend(` <p data-toggle="modal" data-target="#viewWorkModal" style="cursor: pointer;">
                            Workalholicness
                        </p>`);
                        $("body").append(`<div class="modal fade" id="viewWorkModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header" style="background: #D84315;">
                            <h2 class="modal-title" id="exampleModalLabel">
                                Workalholicness
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
                    let newList=newListDOM(data.data.work);
                    if(data.data.work.check)
                    {
                        $(" .one-g",newList).append(`Present`);
                    }
                    else
                    {
                        $(" .one-g",newList).append(`${ data.data.work.toMonth}/${ data.data.work.toYear}`);
                    }
                    if(data.data.work.descrpt)
                    {
                        newList.append(`<div class="work-descrpt">
                                 ${data.data.work.descrpt}
                        </div>`)
                    }
                    $("#viewWorkModal .modal-dialog .modal-content .modal-body ul").prepend(newList);
                    let newUpdateWorkDOMModal=updateWorkDOMModal(data.data.work);
                    if(data.data.work.check)
                    {
                        $(" .modal-dialog .modal-content .modal-body .three-g .checkbox",newUpdateWorkDOMModal).attr("checked",true);
                        $(" .modal-dialog .modal-content .modal-body .one-g .to-date",newUpdateWorkDOMModal).html(`Present`);
                    }
                    else
                    {
                        $(" .modal-dialog .modal-content .modal-body .three-g .checkbox",newUpdateWorkDOMModal).attr("checked",false);
                        $(" .modal-dialog .modal-content .modal-body .one-g .to-date",newUpdateWorkDOMModal).html(`<input type="number" name="toMonth" required value=${data.data.work.toMonth}>
                        <input type="number" name="toYear" required value=${data.data.work.toYear}>`);
                    }
                    $("body").append(newUpdateWorkDOMModal)
                    let editButton=$(" .edit-work-calling",newList);
                    updateWorkModal(editButton)
                    new Noty({
                        theme:"relax",
                        text:`Yay, Go for "Workalholicness"!`,
                        type:"success",
                        layput:"topRight",
                        timeout:1800
                    }).show();
                }
            },
            error:function(err)
            {
                console.log(err.responseText)
            }
        })
    })
}

addWorkFunction();

let newListDOM=function(work)
{
    return $(`<li id="work-${work._id}" class="work-list">
    <div class="edit-work">
    <a href="/users/update-work-modal/?id=${work._id}" class="edit-work-calling"><i class="fas fa-pen-square"></i></a>
    </div>
    <div class="two-g">
    <div style="width: 70%;">
        <div class="title">
            ${work.title}
        </div>
        <div class="company">
            ${work.company}
        </div>
    </div>
    <div class="one-g">
        ${ work.fromMonth}/${ work.fromYear} to
    </div>
</div>
</li>`)
}

let updateWorkModal=function(link)
{
    console.log($(link));
    $(link).click(function(e)
    {
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(link).prop("href"),
            success:function(data)
            {
                console.log(data.data.work._id);
                if(data.data.work.check)
                {
                    $(`#workUpdateModal-${data.data.work._id} .modal-dialog .modal-content .modal-body .three-g .checkbox input`).attr("checked",true);
                    $(`#workUpdateModal-${data.data.work._id} .modal-dialog .modal-content .modal-body .one-g .to-date`).html(`Present`);
                }
                else
                {
                    $(`#workUpdateModal-${data.data.work._id} .modal-dialog .modal-content .modal-body .three-g .checkbox input`).attr("checked",false);
                    $(`#workUpdateModal-${data.data.work._id} .modal-dialog .modal-content .modal-body .one-g .to-date`).html(`<input type="number" name="toMonth" required value=${data.data.work.toMonth}>
                    <input type="number" name="toYear" required value=${data.data.work.toYear}>`);
                }
                $(`#workUpdateModal-${data.data.work._id}`).modal('show');
                addWorkCheckBox1(data.data.work)
                updateModalFormSubmit($(`#workUpdateModal-${data.data.work._id} form`))
            },
            error:function(err)
            {
                console.log(err.responseText);
            }
        })
    })
}

let updateWorkDOMModal=function(work)
{
    return $(` <div class="modal fade update-work-modal" id="workUpdateModal-${work._id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Wanna Update this?</h5>
        </div>
        <form action="/users/update-work" method="post">
            <div class="modal-body">
                    <input type="hidden" name="workID" value=${work._id }>
                    <div class="three-g">
                        <div>
                            <span>Title:</span>
                            <input type="text" name="title" value=${work.title} required>
                        </div>
                        <div>
                            <span>Company:</span>
                            <input type="text" name="company" required value=${work.company}>
                        </div>
                        <div>
                            <span>Description:</span>
                            <textarea name="descrpt" onkeydown="autosize1(this)">${ work.descrpt }</textarea>
                        </div>
                        <div class="checkbox">
                            <input type="checkbox" name="check">
                            <span>I am currently working in this role</span>
                        </div>
                    </div>
                    <div class="one-g">
                        <span>Date:</span>
                        <div>
                            <div class="from-date">
                            <input type="number" name="fromMonth" required value=${work.fromMonth}>
                            <input type="number" name="fromYear" required value=${work.fromYear}>
                            </div>
                            <div class="to-div">
                            to  
                            </div> 
                            <div class="to-date">
                                
                            </div>
                        </div>
                    </div>
            </div>
            <div class="modal-footer">
                    <button type="submit" class="add-work-button btn btn-info">
                            Submit
                    </button>
                    <button data-dismiss="modal" class="btn btn-secondary">Dismiss</button>
            </div>
        </form>
      </div>
    </div>
  </div>`)
}

let updateModalFormSubmit=function(form)
{
    console.log($(form));
    $(form).submit(function(e)
    {
        e.preventDefault();
        $.ajax({
            type:"post",
            url:$(form).prop("action"),
            data:$(form).serialize(),
            success:function(data)
            {
                console.log(data.data);
                if(data.error)
                {
                    new Noty({
                        theme:"relax",
                        text:`${data.message}`,
                        type:"error",
                        layput:"topRight",
                        timeout:1800
                    }).show();
                }
                else
                {
                    $(`#workUpdateModal-${data.data.work._id}`).modal('hide');
                    $('.modal-backdrop').remove();
                    $('body').removeClass( "modal-open" );
                    let newList=newListDOM(data.data.work);
                    if(data.data.work.check)
                    {
                        $(" .one-g",newList).append(`Present`);
                    }
                    else
                    {
                        $(" .one-g",newList).append(`${ data.data.work.toMonth}/${ data.data.work.toYear}`);
                    }
                    if(data.data.work.descrpt)
                    {
                        newList.append(`<div class="work-descrpt">
                                 ${data.data.work.descrpt}
                        </div>`)
                    }
                    $(`#work-${data.data.work._id}`).html(newList.html())
                }
            },
            error:function(err)
            {
                console.log(err.responseText);
            }
        })
    })
}

let convertWorkToAjax=function()
{
    $("#viewWorkModal .modal-dialog .modal-content .modal-body ul>li").each(function()
    {
        let self=$(this);
        let updateModalButton=$(" .edit-work-calling",self);
        updateWorkModal(updateModalButton)
    })
}
convertWorkToAjax()

