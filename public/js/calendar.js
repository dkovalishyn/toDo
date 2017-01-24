$(function(){
    
    sessionStorage.currMonth = moment().format("YYYY-MM");
    
    $('#content').on('click', '#curr-month', function(){
        calendar.getCalendar();
    });
    
    $('#content').on('click', '#next-month', function(){
        calendar.getCalendar('next');
    });
    
    $('#content').on('click', '#previous-month', function(){
       calendar.getCalendar('prev');
    });
        
    /* Выделить задачу розовым цветом при наведении*/
    $('#content').on('mouseenter', '.calendar__task:not(.calendar__task_empty)', calendar.taskOver);
    $('#content').on('mouseleave', '.calendar__task:not(.calendar__task_empty)', calendar.taskLeave); 
    
    /* Показать подсказку при наведении на аватар пользователя*/
    $('#content').on('mouseenter', '.user-menu__avatar', calendar.userOver);
    $('#content').on('mouseleave', '.user-menu__avatar', calendar.userLeave);

    /* Открыть детальную информацию по задаче в модальном окне */
    $('#content').on('click', '.calendar__task:not(.calendar__task_empty)', function(e){
        var id = e.currentTarget.getAttribute('data-id');
        calendar.getTask(id);
    });

    /* Посмотреть задачи, что не поместились в календарь */        
    $('#content').on('click', '.calendar__task_more', function(e){
        var id = e.currentTarget.getAttribute('data-id');
        calendar.getDay(id);
    });

});

var calendar = {
    taskOver: function(e){
        var id = $(e.currentTarget).attr('data-id');
        var description = $(e.currentTarget).attr('data-desc');
        $('[data-id ="' + id + '"]').addClass('active');
        $('#content').append('<div id="tooltip"><span>' + description + '</span></div>');
        $('#tooltip').css({ 'top' : e.pageY + 5 , 'left' : e.pageX + 5 });
    },
    taskLeave: function(e){
        var id = $(e.currentTarget).attr('data-id');
        $('[data-id ="' + id + '"]').removeClass('active');
        $('#tooltip').remove();
    }, 
    userOver: function(e){
        var login = $(e.currentTarget).attr('data-login');
        $('#content').append('<div id="tooltip"><span>' + login + '</span></div>');
        $('#tooltip').css({ 'top' : e.pageY + 5 , 'left' : e.pageX + 5 });
    },
    userLeave: function(e){
        var login = $(e.currentTarget).attr('data-login');
        $('#tooltip').remove();
    },
    getCalendar: function(modifier){
        var date = moment();
        if(modifier == 'next'){
            date = moment(sessionStorage.currMonth, 'YYYY-MM').add(1, 'Month');
        } else if(modifier == 'prev') {
            date =  moment(sessionStorage.currMonth, 'YYYY-MM').subtract(1, 'Month');
        }
        sessionStorage.currMonth = date.format("YYYY-MM");

        $.ajax({
            method: 'GET',
            url: '/api/getCalendar/' + getLogin(),
            data: {date: date.format('YYYY-MM')},
            success: function(html){
               $('#content').html(html);
            },
            error: function(e, textStatus){
                console.log("Error: " + textStatus);
            }
       });
    },
    getTask: function(id){
        $.ajax({
            method: 'GET',
            url: '/api/getTask/' + id + '?login=' + getLogin(),
            success: function(html){
                $('.fixed-overlay').html(html);
                task.show();
                window.location.hash = "!/task/" + id;
            },
            error: function(e, textStatus){
                console.log("Error: " + textStatus);
            }
       });
    },
    getDay: function(id){
         $.ajax({
            method: 'GET',
            url: '/api/getDay/' + id,
            success: function(html){
                $('.fixed-overlay').html(html);
                window.location.hash = "!/day/" + id;
                $('.fixed-overlay').fadeIn();
                task.show();
            },
            error: function(e, textStatus){
                console.log("Error: " + textStatus);
            }
       });
    }
};


var task = {
    show: function(){
        $('input[type="range"]').ionRangeSlider();
        $('.fixed-overlay').on('click','button[name="send-comment"]',this.sendMessage);
        $('.fixed-overlay').on('click', 'button#save-progress', this.changeProgress);
        $('.fixed-overlay').click(this.hideWindow);
        $('.fixed-overlay').fadeIn();  
    },
    sendMessage: function(){
        var text = $('input[type="text"]').val();
        if (text.length === 0) return;
        $.ajax({
            method:"POST",
            url:"/api/sendMessage/" + getTaskID() + '?login=' + getLogin(),
            data: {text: encodeURIComponent(text)},
            success: function(html){
                $('.fixed-overlay').html(html); 
                $('input[type="range"]').ionRangeSlider();
            },
            error: function(e, textStatus){
                console.log("Error: " + textStatus);
            }
        });
    },
    changeProgress: function(){
        var progress = $('input[type="range"]').val(),
            status = $('input[name="status"]:checked').val();
        $.ajax({
            method:"POST",
            url:"/api/changeTask/" + getTaskID(),
            data: {progress: progress, status: status},
            success: function(html){
                $('.fixed-overlay').html(html); 
                task.show();
            },
            error: function(e, textStatus){
                console.log("Error: " + textStatus);
            }
        });  
    },
    hideWindow: function(e){
         if ($(e.target).hasClass('fixed-overlay')){
              $('.modal').remove();
              $('.fixed-overlay').fadeOut();
              window.location.hash = '';
        }   
    }

};

function getTaskID(){
    var path = window.location.hash.slice(2).split('/');
    return path[path.length-1];
}

function getLogin(){
    var path = window.location.pathname.slice(2).split('/');
    return path[path.length-1];
}
