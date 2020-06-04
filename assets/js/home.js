var nameID=$("#name");
var emailID=$("#email")
var pwdID=$("#pwd");
var confirmpwdID=$("#pwd2");
var submitsingup=$("#submit-signup");


nameID.on("mouseenter",function()
{
    console.log("name")
    nameID.addClass("bckgd-dark");
    emailID.removeClass("bckgd-dark");
    pwdID.removeClass("bckgd-dark");
    confirmpwdID.removeClass("bckgd-dark");
})

emailID.on("mouseenter",function()
{
    console.log("email");
    nameID.removeClass("bckgd-dark");
    emailID.addClass("bckgd-dark");
    pwdID.removeClass("bckgd-dark");
    confirmpwdID.removeClass("bckgd-dark");
})

pwdID.on("click",function()
{
    console.log("pwd");
    nameID.removeClass("bckgd-dark");
    emailID.removeClass("bckgd-dark");
    pwdID.addClass("bckgd-dark");
    confirmpwdID.removeClass("bckgd-dark");
})

confirmpwdID.on("click",function()
{
    nameID.removeClass("bckgd-dark");
    emailID.removeClass("bckgd-dark");
    pwdID.removeClass("bckgd-dark");
    confirmpwdID.addClass("bckgd-dark");
})

submitsingup.on("click",function()
{
    nameID.removeClass("bckgd-dark");
    emailID.removeClass("bckgd-dark");
    pwdID.removeClass("bckgd-dark");
    confirmpwdID.removeClass("bckgd-dark");
})

var textarea = document.querySelectorAll('form textarea');

for(let i=0;i<textarea.length;i++)
{
    textarea[i].addEventListener('keydown', autosize);
}
             
function autosize(){
  var el = this;
  setTimeout(function(){
    el.style.cssText = 'height:auto; padding:0';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
  },0);
}

            
function autosize1(textarea){
  var el = textarea;
  setTimeout(function(){
    el.style.cssText = 'height:auto; padding:0';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
  },0);
}


function submitForm(x)
{
    console.log(x);
    let postID=x["name"];
    console.log(postID);
     $(`#post-${postID}-share-form`).submit();
}

function removetagVisible(x){

  let replyID=x["name"];
  console.log(replyID);
  $(`#removetag-${replyID}`).css("display","block");
}

function removetagInvisible(){

  $('.removetag').css("display","none");
}
$(document).ready(function()
{
  removetagInvisible();
})

window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted || 
                           ( typeof window.performance != "undefined" && 
                                window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
      window.location.reload();
    }
});

let pwd1=document.getElementById("pwd");
let pwd2=document.getElementById("pwd2");
function togglePassword(x)
{
  let id=$(x).prop("id");
    if(id=="pwd-eye")
    {
      if(pwd1.type==="password")
      {
        pwd1.type="text";
      }
      else
      {
        pwd1.type="password";
      }
    }
    else
    {
        if(pwd2.type==="password")
        {
          pwd2.type="text";
        }
        else
        {
          pwd2.type="password";
        }
    }
}

let submitSignForm=function()
{
   console.log($(".display-signUp-form #sign-up-form"));
   $(".display-signUp-form #sign-up-form").submit(function(e)
   {
      e.preventDefault();
      $.ajax({
        type:"post",
        url:$(".display-signUp-form #sign-up-form").prop("action"),
        data:$(".display-signUp-form #sign-up-form").serialize(),
        success:function(data)
        {
            console.log(data.data);
            if(data.data.error)
            {
                  new Noty({
                    theme:"relax",
                    text:`${data.data.message}`,
                    type:"error",
                    layput:"topRight",
                    timeout:1500
                }).show();
            }
            else
            {
                    new Noty({
                      theme:"relax",
                      text:`${data.data.message}`,
                      type:"success",
                      layput:"topRight",
                      timeout:1500
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
submitSignForm();

let submitForgetPassEmailForm=function()
{
   console.log($(".forget-email-password"));
   $(".forget-email-password").submit(function(e)
   {
      e.preventDefault();
      $.ajax({
        type:"post",
        url:$(".forget-email-password").prop("action"),
        data:$(".forget-email-password").serialize(),
        success:function(data)
        {
            console.log(data.data);
            if(data.data.error)
            {
                  new Noty({
                    theme:"relax",
                    text:`${data.data.message}`,
                    type:"error",
                    layput:"topRight",
                    timeout:1500
                }).show();
            }
            else
            {
                    new Noty({
                      theme:"relax",
                      text:`${data.data.message}`,
                      type:"success",
                      layput:"topRight",
                      timeout:1500
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
submitForgetPassEmailForm();

let submitNewPassForm=function()
{
   console.log($("#new-password-form"));
   $("#new-password-form").submit(function(e)
   {
      e.preventDefault();
      $.ajax({
        type:"post",
        url:$("#new-password-form").prop("action"),
        data:$("#new-password-form").serialize(),
        success:function(data)
        {
            console.log(data.data);
            if(data.data.error)
            {
                  new Noty({
                    theme:"relax",
                    text:`${data.data.message}`,
                    type:"error",
                    layput:"topRight",
                    timeout:1500
                }).show();
            }
            else
            {
                    new Noty({
                      theme:"relax",
                      text:`${data.data.message}`,
                      type:"success",
                      layput:"topRight",
                      timeout:1500
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
submitNewPassForm();

let searchFunction= function()
{
      let text=$("#search-input-field").val();
      if(text.length<=1)
      {
        $(".search-bar ul a").remove()
        return;
      }
      $.ajax({
        type:"get",
        url:`/search/?search=${text}`,
        success:function(data)
        {
          let ul=$(".search-bar ul");
          ul.empty();
          for(let user of data.data.usersFound)
          {
              ul.append($(`<a href="/users/profile/${user.id}" target="_blank">
                    <img src=${user.avatar}>
                    ${user.name}
                </a>`));
          }
        },
        error:function(err)
        {
          console.log(err.responseText);
        }
      })
}

let appendSearchList=function(user)
{
  return $(`<li>
  <a href="/users/profile/${user.id}>
        <img src=${user.avatar}>
        ${user.name}
  </a>
</li>`)

}