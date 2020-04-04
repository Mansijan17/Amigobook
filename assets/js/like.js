var count=$(".count b");
var likebutton=$(".like-thumbs");

var toggle=false;

for(let i=0;i<likebutton.length;i++)
{
    likebutton[i].addEventListener("click",function()
    {
        let countValue=parseInt(count[i].innerHTML);
        //console.log(countValue);
        if(!toggle)
        {
            countValue++;
            count[i].innerHTML=countValue;
            toggle=true;
        }
        else
        {
            countValue--;
            count[i].innerHTML=countValue;
            toggle=false;
        }
    })
}