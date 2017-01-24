$(function(){
    $('input, textarea').placeholder();
    $('#start-date, #end-date').datepicker({
        dayNamesMin : ['ВС', 'ПН','ВТ','СР','ЧТ','ПТ','СБ'],
        monthNames : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль', 'Август', 'Сентябрь', 'Октябрь','Ноябрь','Декабрь'],
        firstDay: 1,
        dateFormat: "dd/mm/yy"
    });
    var  data = {};
    
    $('button').click(setTask);
    
    function setTask(){
        $('input, textarea').removeClass('error');
        var data = {
            user : $('#user').val(),
            startDate : $('#start-date').val(),
            endDate : $('#end-date').val(),
            description :  encodeURIComponent($('#description').val()), 
        };
        
        var startDate = moment(data.startDate, "DD/MM/YYYY");
        var endDate = moment(data.endDate, "DD/MM/YYYY");
        var now = moment();
        // Проверить что дата окончания позже даты начала задачи
        if((isNaN(endDate))||(startDate.isAfter(endDate, 'day'))){
            $('p.error-description').html("Неверно выбрана дата окончания задачи");
            $('#end-date').addClass('error');
            return;
        } 
        
        // Проверить что дата начала не раньше текущей
        if((isNaN(startDate))||(startDate.isBefore(now, 'day'))){
            $('p.error-description').html("Неверно выбрана дата начала задачи");
            $('#start-date').addClass('error');
            return;
        }
        
        if(data.description.length === 3){
            $('p.error-description').html("Введите описание задачи");
            $('#description').addClass('error');
            return;
        }
        
        data.startDate = startDate.format('x');
        data.endDate = endDate.format('x');
        
        $.ajax({
            method: "POST",
            url: "/api/setTask",
            data: data,
            success: function(){
                console.log('Task has been set!');
                window.location.pathname = '/main';
            },
            error: function(e, textMesssage){
                if(textMesssage == 'error'){
                    $('p.error-description').html("Нет такого пользователя"); 
                    $('#user').addClass('error');
                } else {
                    $('p.error-description').html(textMesssage);
                }
            }
        });
    }

});

