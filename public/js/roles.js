$(function(){
    var  data = {};
    
    $('select').on('change', function(e){
       data[e.target.name] = e.target.value;
       console.log(data);
    });
    
    $('button').click(changeRole);
    
    function changeRole(){
        $.ajax({
            method: "POST",
            url: "/api/changeRoles",
            data: data,
            success: function(){
                console.log('Roles has been changed!');
                window.location.pathname = '/main';
            },
            error: function(e, textMesssage){
                console.log('Roles has not been updated!' + textMesssage);
            }
        });
    }

});