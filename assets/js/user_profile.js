$(".change-email a").click(function(e)
{
    e.preventDefault();
    $.ajax({
        type:"get",
        url:$(".change-email a").prop("href"),
        success:function(data)
        {
            new Noty({
                theme:"relax",
                text:`${data.message}`,
                type:"success",
                layput:"topRight",
                timeout:1800
            }).show();
        },
        error:function(err)
        {
            console.log(err.responseText);
            return;
        }
    })
})


function modalFormCheckBox(modal)
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
modalFormCheckBox($("#addWorkFormModal"))
modalFormCheckBox($("#addGradFormModal"))

function modalFormCheckBox1(data)
{
    let modal=$(`#${data.type}UpdateModal-${data.updatedObj._id}`)
    let checkbox =$(" .checkbox input",modal);
    console.log("hi",checkbox,modal)
    checkbox.click(function()
    {
        if(!data.updatedObj.fromMonth)
            {
                $(".from-date").html(`<input type="number" name="fromMonth" required placeholder="01">
                <input type="number" name="fromYear" required placeholder="2020">`)
            }
            else
            {
                $(".from-date").html(`<input type="number" name="fromMonth" required value=${data.updatedObj.fromMonth}>
                <input type="number" name="fromYear" required value=${data.updatedObj.fromYear}>`)
            }
        if($(this).prop("checked")==true)
        {
            $(".to-date").html(`Present`)
        }
        else if($(this).prop("checked")==false)
        {
            if(!data.updatedObj.toMonth)
            {
                $(".to-date").html(`<input type="number" name="toMonth" required placeholder="01">
                <input type="number" name="toYear" required placeholder="2020">`)
            }
            else
            {
                $(".to-date").html(`<input type="number" name="toMonth" required value=${data.updatedObj.toMonth}>
                <input type="number" name="toYear" required value=${data.updatedObj.toYear}>`)
            }
        }
    })
    
}

function successAddWorkGrad(data)
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
        let type;
        if(data.data.type=="work")
        {
            type="Work";
        }
        else
        {
            type="Grad"
        }
        console.log("type self", type)
        $(`#add${type}FormModal`).modal('hide');
        $('.modal-backdrop').remove();
        $('body').removeClass( "modal-open" );
        if(data.data.length==1)
        {
            if(type=="Work")
            {
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
            else
            {
                    $(".profile-intro .first .accordion #collapseThree .card-body").prepend(` <p data-toggle="modal" data-target="#viewGradModal" style="cursor: pointer;">
                            Gradenation
                    </p>`);
                    $("body").append(`<div class="modal fade" id="viewGradModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header" style="background: #8e144c;">
                            <h2 class="modal-title" id="exampleModalLabel">
                                Gradenation
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
            
        }
        let newList;
        if(type=="Work")
        {
            newList=newListDOM(data.data.object);
        }
        else
        {
            newList=newListGradDOM(data.data.object);
        }
        if(data.data.object.check)
        {
            $(" .one-g",newList).append(`Present`);
        }
        else
        {
            $(" .one-g",newList).append(`${ data.data.object.toMonth}/${ data.data.object.toYear}`);
        }
        if(data.data.object.descrpt)
        {
            newList.append(`<div class="${data.data.type}-descrpt">
                     ${data.data.object.descrpt}
            </div>`)
        }
        let newUpdateWorkGradDOMModal;
        if(type=="Work")
        {
            $("#viewWorkModal .modal-dialog .modal-content .modal-body ul").prepend(newList);
            newUpdateWorkGradDOMModal=updateWorkDOMModal(data.data.object);
        }
        else
        {
            $("#viewGradModal .modal-dialog .modal-content .modal-body ul").prepend(newList);
            newUpdateWorkGradDOMModal=updateGradDOMModal(data.data.object);
        }
        
        if(data.data.object.check)
        {
            $(" .modal-dialog .modal-content .modal-body .three-g .checkbox",newUpdateWorkGradDOMModal).attr("checked",true);
            $(" .modal-dialog .modal-content .modal-body .one-g .to-date",newUpdateWorkGradDOMModal).html(`Present`);
        }
        else
        {
            $(" .modal-dialog .modal-content .modal-body .three-g .checkbox",newUpdateWorkGradDOMModal).attr("checked",false);
            $(" .modal-dialog .modal-content .modal-body .one-g .to-date",newUpdateWorkGradDOMModal).html(`<input type="number" name="toMonth" required value=${data.data.object.toMonth}>
            <input type="number" name="toYear" required value=${data.data.object.toYear}>`);
        }
        $("body").append(newUpdateWorkGradDOMModal)
        console.log("new update modal",newUpdateWorkGradDOMModal);
        let editButton=$(` .edit-${data.data.type}-calling`,newList);
        console.log("edit button",editButton);
        updateWorkGradModal(editButton);
        let newDeleteWorkGradModalDOM;
        if(data.data.type=="work")
        {
            newDeleteWorkGradModalDOM=deleteWorkModalDOM(data.data.object);
        }
        else
        {
            newDeleteWorkGradModalDOM=deleteGradModalDOM(data.data.object);
        }
        $("body").append(newDeleteWorkGradModalDOM);
        let deleteButton=$(` .delete-${data.data.type}-calling`,newList);
        deleteWorkGradModal(deleteButton)
        if(data.data.type=="work")
        {   
            new Noty({
                theme:"relax",
                text:`Yay, Go for "Workalholicness"!`,
                type:"success",
                layput:"topRight",
                timeout:1800
            }).show();
        }
        else
        {
            new Noty({
                theme:"relax",
                text:`"Gradenation", it is!`,
                type:"success",
                layput:"topRight",
                timeout:1800
            }).show();
        }
      
    }
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
            success:successAddWorkGrad,
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
    <a href="/users/workgrad/update-modal/?type=work&id=${work._id}" class="edit-work-calling"><i class="fas fa-pen-square"></i></a>
    </div>
    <div class="delete-work">
        <a href="/users/workgrad/delete-modal/?type=work&id=${work._id }" class="delete-work-calling">
            <i class="fas fa-minus-square"></i>
        </a>
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

let updateWorkGradModal=function(link)
{
    console.log("after form",$(link));
    $(link).click(function(e)
    {
        e.preventDefault();
        $.ajax({
            type:"get",
            url:$(link).prop("href"),
            success:function(data)
            {
                console.log(data.data);
                if(data.data.updatedObj.check)
                {
                    console.log("check",$(`#${data.data.type}UpdateModal-${data.data.updatedObj._id} .modal-dialog .modal-content .modal-body .three-g .checkbox input`))
                    $(`#${data.data.type}UpdateModal-${data.data.updatedObj._id} .modal-dialog .modal-content .modal-body .three-g .checkbox input`).prop("checked",true);
                    $(`#${data.data.type}UpdateModal-${data.data.updatedObj._id} .modal-dialog .modal-content .modal-body .one-g .to-date`).html(`Present`);
                }
                else
                {
                    $(`#${data.data.type}UpdateModal-${data.data.updatedObj._id} .modal-dialog .modal-content .modal-body .three-g .checkbox input`).prop("checked",false);
                    $(`#${data.data.type}UpdateModal-${data.data.updatedObj._id} .modal-dialog .modal-content .modal-body .one-g .to-date`).html(`<input type="number" name="toMonth" required value=${data.data.updatedObj.toMonth}>
                    <input type="number" name="toYear" required value=${data.data.updatedObj.toYear}>`);
                }
                $(`#${data.data.type}UpdateModal-${data.data.updatedObj._id}`).modal('show');
                modalFormCheckBox1(data.data)
                updateModalFormSubmit($(`#${data.data.type}UpdateModal-${data.data.updatedObj._id} form`))
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
        <form action="/users/workgrad/update-work-grad" method="post">
            <div class="modal-body">
                    <input type="hidden" name="id" value=${work._id }>
                    <input type="hidden" name="type" value="work">
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
                    <button type="submit" class="btn btn-info">
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
    console.log("update form",$(form));
    $(form).submit(function(e)
    {
        e.preventDefault();
        e.stopImmediatePropagation();
        $.ajax({
            type:"post",
            url:$(form).prop("action"),
            data:$(form).serialize(),
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
                    $(`#${data.data.type}UpdateModal-${data.data.object._id}`).modal('hide');
                    $('.modal-backdrop').remove();
                    $('body').removeClass( "modal-open");
                    let newList;
                    if(data.data.type=="work")
                    {
                        newList=newListDOM(data.data.object);
                    }
                    else
                    {
                        newList=newListGradDOM(data.data.object)
                    }
                    if(data.data.object.check)
                    {
                        $(" .one-g",newList).append(`Present`);
                    }
                    else
                    {
                        $(" .one-g",newList).append(`${ data.data.object.toMonth}/${ data.data.object.toYear}`);
                    }
                    if(data.data.object.descrpt)
                    {
                        newList.append(`<div class="${data.data.type}-descrpt">
                                 ${data.data.object.descrpt}
                        </div>`)
                    }
                    $(`#${data.data.type}-${data.data.object._id}`).html(newList.html())
                    let editButton=$(`#${data.data.type}-${data.data.object._id} .edit-${data.data.type}-calling`);
                    console.log("form se button",editButton);
                    updateWorkGradModal(editButton);
                    let deleteButton=$(`#${data.data.type}-${data.data.object._id} .delete-${data.data.type}-calling`);
                    deleteWorkGradModal(deleteButton)
                    
                    new Noty({
                        theme:"relax",
                        text:`Welcome to Updatestan!`,
                        type:"success",
                        layput:"topRight",
                        timeout:1800
                    }).show();
                }
            },
            error:function(err)
            {
                console.log(err.responseText);
            }
        })
    })
}

let deleteWorkGradModal=function(link)
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
                console.log(data.data.item._id);
                $(`#${data.data.type}DeleteModal-${data.data.item._id}`).modal('show');
                deleteWorkGrad($(`#${data.data.type}DeleteModal-${data.data.item._id} .delete-${data.data.type}-button`));
            },
            error:function(err)
            {
                console.log(err.responseText);
            }
        })
    })
}

let deleteWorkModalDOM=function(work)
{
    return $(`<div class="modal fade delete-work-warning" id="workDeleteModal-${work._id}" data-backdrop="static" >
    <div class="modal-dialog" role="document">
    <div class="modal-content">
        <div class="modal-header">
        <h2 class="modal-title">Withdraw this <i class="fas fa-mail-bulk"></i>?</h2>
        </div>
        <div class="modal-body">
        <p>Are you sure you want to quit this information? </p>
        </div>
        <div class="modal-footer">
            <a href="/users/workgrad/delete-work-grad/?type=work&id=${work._id}" class="delete-work-button">
                Delete
            </a>
            <a data-dismiss="modal" class="discard-button">Discard</a>
        </div>
    </div>
    </div>
</div>`)
}

let deleteGradModalDOM=function(grad)
{
    return $(`<div class="modal fade delete-grad-warning" id="gradDeleteModal-${grad._id}" data-backdrop="static" >
    <div class="modal-dialog" role="document">
    <div class="modal-content">
        <div class="modal-header">
        <h2 class="modal-title">Withdraw this <i class="fas fa-school"></i>?</h2>
        </div>
        <div class="modal-body">
        <p>Are you sure you want to quit this information? </p>
        </div>
        <div class="modal-footer">
            <a href="/users/workgrad/delete-work-grad/?type=grad&id=${grad._id}" class="delete-grad-button">
                Delete
            </a>
            <a data-dismiss="modal" class="discard-button">Discard</a>
        </div>
    </div>
    </div>
</div>`)
}

let deleteWorkGrad=function(link)
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
                console.log(data.data);
                let type;
                if(data.data.type=="work")
                {
                    type="Work";
                }
                else
                {
                    type="Grad";
                }
                $(`body #${data.data.type}DeleteModal-${data.data.obj._id}`).modal('hide');
                $(`body #${data.data.type}DeleteModal-${data.data.obj._id}`).remove();
                $('.modal-backdrop').remove();
                $('body').removeClass( "modal-open");
                $(`#${data.data.type}-${data.data.obj._id}`).remove();
                if(data.data.length==0)
                {
                    console.log("0")
                    $(`body #view${type}Modal`).modal('hide');
                    $(`body #view${type}Modal`).remove();
                    $('.modal-backdrop').remove();
                    $('body').removeClass( "modal-open" );
                    $(`body .delete-${type}-warning`).remove();
                    $(`body .update-${type}-modal`).remove();
                    if(type=="Work")
                    {
                        console.log("work",$("#collapseTwo .card-body"))
                        $("#collapseTwo .card-body p").remove();
                        $("#collapseTwo .card-body").prepend(`<p data-toggle="modal" data-target="#addWorkFormModal" style="cursor: pointer;">Want to brag about it?</p>`)
                    }
                    else
                    {
                        $("#collapseThree .card-body p").remove();
                        $("#collapseThree .card-body").prepend(`<p data-toggle="modal" data-target="#addGradFormModal" style="cursor: pointer;">Wanna take this to academic mode?</p>`)
                    }   
                }
                new Noty({
                    theme:"relax",
                    text:`Instructions do come true!`,
                    type:"success",
                    layput:"topRight",
                    timeout:1800
                }).show();
            },
            error:function(err)
            {
                console.log(err.responseText);
            }
        })
    })
}

let addGradFunction=function()
{
    console.log($("#addGradFormModal form"));
    $("#addGradFormModal form").submit(function(e)
    {
        e.preventDefault();
        $.ajax({
            type:"post",
            url:$("#addGradFormModal form").prop("action"),
            data:$("#addGradFormModal form").serialize(),
            success:successAddWorkGrad,
            error:function(err)
            {
                console.log(err.responseText)
            }
        })
    })
}

addGradFunction();

let newListGradDOM=function(grad)
{
    return $(`<li id="grad-${grad._id}" class="grad-list">
    <div class="edit-grad">
    <a href="/users/workgrad/update-modal/?type=grad&id=${grad._id}" class="edit-grad-calling"><i class="fas fa-pen-square"></i></a>
    </div>
    <div class="delete-grad">
        <a href="/users/workgrad/delete-modal/?type=grad&id=${grad._id }" class="delete-grad-calling">
            <i class="fas fa-minus-square"></i>
        </a>
    </div>
    <div class="two-g">
    <div style="width: 70%;">
        <div class="title">
            <b>Remarks:</b> &nbsp; ${grad.grade}
        </div>
        <div class="company">
            ${grad.school}
        </div>
    </div>
    <div class="one-g">
        ${ grad.fromMonth}/${ grad.fromYear} to
    </div>
</div>
</li>`)
}

let updateGradDOMModal=function(grad)
{
    return $(` <div class="modal fade update-grad-modal" id="gradUpdateModal-${grad._id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Improvise this?</h5>
        </div>
        <form action="/users/workgrad/update-work-grad" method="post">
            <div class="modal-body">
                    <input type="hidden" name="id" value=${grad._id }>
                    <input type="hidden" name="type" value="grad">
                    <div class="three-g">
                        <div>
                            <span>Percentage/Grade:</span>
                            <input type="text" name="title" value=${grad.grade} required>
                        </div>
                        <div>
                            <span>School/College:</span>
                            <input type="text" name="company" required value=${grad.school}>
                        </div>
                        <div>
                            <span>Description:</span>
                            <textarea name="descrpt" onkeydown="autosize1(this)">${ grad.descrpt }</textarea>
                        </div>
                        <div class="checkbox">
                            <input type="checkbox" name="check">
                            <span>I am currently enrolled here</span>
                        </div>
                    </div>
                    <div class="one-g">
                        <span>Date:</span>
                        <div>
                            <div class="from-date">
                            <input type="number" name="fromMonth" required value=${grad.fromMonth}>
                            <input type="number" name="fromYear" required value=${grad.fromYear}>
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
                    <button type="submit" class="btn btn-info">
                            Submit
                    </button>
                    <button data-dismiss="modal" class="btn btn-secondary">Dismiss</button>
            </div>
        </form>
      </div>
    </div>
  </div>`)
}


let convertWorkToAjax=function()
{
    $("#viewWorkModal .modal-dialog .modal-content .modal-body ul>li").each(function()
    {
        let self=$(this);
        let updateModalButton=$(" .edit-work-calling",self);
        let deleteModalButton=$(" .delete-work-calling",self);
        updateWorkGradModal(updateModalButton);
        deleteWorkGradModal(deleteModalButton);
    })
    $("#viewGradModal .modal-dialog .modal-content .modal-body ul>li").each(function()
    {
        let self=$(this);
        let updateModalButton=$(" .edit-grad-calling",self);
        let deleteModalButton=$(" .delete-grad-calling",self);
        updateWorkGradModal(updateModalButton);
        deleteWorkGradModal(deleteModalButton);
    })
}
convertWorkToAjax()

