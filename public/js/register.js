$(function(){
    $('input, textarea').placeholder();
    $('.fixed-overlay').fadeIn();
    $('.fixed-overlay').click(function(e){
        if($(e.target).hasClass('fixed-overlay')){
            $('.fixed-overlay').remove('.modal');
            $('.fixed-overlay').fadeOut();
            window.location.pathname = "/";
        }
    });
    
    $('input').on('change', function(){
        $('input').removeClass('error');
        $('p.error-description').html('');
    });
    
    $('form').on('submit', function(){ 
        return register();
    });
});
    

function register(){
    var login = $('#login').val().toLowerCase(),
        pass = $('#pass').val(),
        copyPass = $('#copy-pass').val(),
        email = $('#email').val();
    
    if (pass!==copyPass){
        $('#pass').addClass('error');
        $('#copy-pass').addClass('error');
        $('p.error-description').html("Пароли не совпадают");
        return false;
    } 
    
    var emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegExp.test(email)) {
        $('#email').addClass('error');
        $('p.error-description').html("Неверный e-mail");
        return;
    }
    
        var query = '?login='+login+'&pass='+pass+'&email='+email;
    $.ajax({
        method: "POST",
        url:  "api/register" + query  
    }).done(function(msg){
       if(!msg.match(/^[error]/gi)){  
           sessionStorage.setItem('user', login);
           window.location="/main";
           $('.fixed-overlay').remove('.modal');
           $('.fixed-overlay').fadeOut();
       }
       if(msg==='error: login is not available'){
           $('#login').addClass('error');
           $('p.error-description').html("Логин уже существует");
       }
    });
    return false;
}
