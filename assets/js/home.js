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
    // for box-sizing other than "content-box" use:
    // el.style.cssText = '-moz-box-sizing:content-box';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
  },0);
}

            
function autosize1(textarea){
  var el = textarea;
  console.log(el);
  setTimeout(function(){
    el.style.cssText = 'height:auto; padding:0';
    // for box-sizing other than "content-box" use:
    // el.style.cssText = '-moz-box-sizing:content-box';
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

// function submitCommentUpdateForm(x)
// {
//   let commentID=x["name"];
//   console.log(commentID);
//   console.log($(`#comment-${commentID}-update-form`))
//   $(`#comment-${commentID}-update-form`).submit();
// }

// function submitReplyModal(x)
// {
//     console.log(x);
//     let commentID=x["name"];
//     console.log(commentID);
//      $(`#comment-${commentID}-reply-form`).submit();
// }

window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted || 
                           ( typeof window.performance != "undefined" && 
                                window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
      // Handle page restore.
      window.location.reload();
    }
  });