function addWorkCheckBox()
{
    let checkbox =$("#addWorkFormModal .checkbox input");
    console.log(checkbox,"hi");
    checkbox.click(function()
    {
        if($(this).prop("checked")==true)
        {
            console.log("yes");
            $(".to-date").html(`Present`)
        }
        else if($(this).prop("checked")==false)
        {
            console.log("no");
            $(".to-date").html(`<input type="number" name="toMonth" required placeholder="01">
            <input type="number" name="toYear" required placeholder="2020">`)
        }
    })
    
}
addWorkCheckBox()