$(function(){
    
    $("#content").on('click', 'th', sort);
    
    $("#content").on('click', 'tbody tr', getTask);
    
    function sort(e){
       var id = $(e.target).attr('data-id');

        $.ajax({
            method: "POST",
            url: "/api/sortTasksList/"+id,
            success: function(html){
                $("#content").html(html);
                console.log('Tasks list sorted!');
            },
            error: function(e){
                console.log('Tasks has not been sorted! ' + e);
            }
        });
    }

});

function getTask(e){
    var id = e.currentTarget.getAttribute("data-id");
        $.ajax({
            method: 'GET',
            url: '/api/getTask/' + id,
            success: function(html){
                window.location.hash = "!/task/" + id;
                $('.fixed-overlay').html(html);
                task.show();
                $('.fixed-overlay').fadeIn();  
            },
            error: function(e, textStatus){
                console.log("Error: " + textStatus);
            }
       });
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
        if (!text) return;
        $.ajax({
            method:"POST",
            url:"/api/sendMessage/" + getTaskID(),
            data: {text: encodeURIComponent(text)},
            success: function(html){
                $('.fixed-overlay').html(html); 
                task.show();
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