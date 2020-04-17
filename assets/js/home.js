var nameID=$("#name");
var emailID=$("#email")
var pwdID=$("#pwd");
var confirmpwdID=$("#pwd2");
var submitsingup=$("#submit-signup");


nameID.on("click",function()
{
    nameID.addClass("bckgd-dark");
    emailID.removeClass("bckgd-dark");
    pwdID.removeClass("bckgd-dark");
    confirmpwdID.removeClass("bckgd-dark");
})

emailID.on("click",function()
{
    nameID.removeClass("bckgd-dark");
    emailID.addClass("bckgd-dark");
    pwdID.removeClass("bckgd-dark");
    confirmpwdID.removeClass("bckgd-dark");
})

pwdID.on("click",function()
{
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