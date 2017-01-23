$(function(){
    $('input, textarea').placeholder();
    $('#birthday').datepicker({
        dayNamesMin : ['ВС', 'ПН','ВТ','СР','ЧТ','ПТ','СБ'],
        monthNames : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль', 'Август', 'Сентябрь', 'Октябрь','Ноябрь','Декабрь'],
        firstDay: 1,
        dateFormat: "dd/mm/yy"
    });
    var  data = {};
    
    $('button').click(changeProfile);
    
    function changeProfile(){
        var data = {
            name : $('#name').val(),
            secondName : $('#second-name').val(),
            lastName : $('#last-name').val(),
            photo :  $('#photo').val(),
            birthday : $('#birthday').val(),   
            email : $('#email').val()   
        };
        
        //Удалить пустые значения
        for (var key in data){
            if (!data[key]) delete data[key];
        }
        
        var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        
        if ((data.email)&&(!emailRegExp.test(data.email))){
            $('#email').addClass('error');
            $('#email').val('Неверный e-mail');
            return;
        }
        
        $.ajax({
            method: "POST",
            url: "/api/changeProfile",
            data: data,
            success: function(){
                console.log('Profile has been changed!');
                window.location.pathname = '/main';
            },
            error: function(e, textMesssage){
                console.log('Profile has not been updated!' + textMesssage);
            }
        });
    }

});