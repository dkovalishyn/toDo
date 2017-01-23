$(function(){
    var owl = $('.owl-carousel');
    owl.owlCarousel({
        items: 1,
        margin:10,
        autoplay:true,
        autoplayTimeout:3000,
        autoplayHoverPause:false,
        dots: true,
        singleItem: true,
        lazyLoad: true
    });
    $('.btn__login').show(); 
    $('.fixed-overlay').hide();
    $('.btn__login').click(showLogin);
});


function showLogin(){
    window.location.hash = "#!/login";
    $('input, textarea').placeholder();
    $('.fixed-overlay').fadeIn();
    $('.fixed-overlay').click(function(e){
    if($(e.target).hasClass('fixed-overlay')){
            hide();
        }
    })

    $('form').on('submit', function(){ 
    $('input').removeClass('error');
    $('p.error-description').html('');
    return verify();
    });
}


function verify(){
    var login = $('#login').val(),
        pass = $('#pass').val(),
        query = '?login='+login+'&pass='+pass;
    $.ajax({
        method: "GET",
        url:  "/api/verify" + query  
    }).done(function(msg){
           localStorage.setItem('user', login);
           document.cookie = "secret=" + msg;
           window.location.pathname="/main";
           hide();
       
    }).fail(function(jqXHR, textStatus){
       if( jqXHR.responseText==='error: wrong login'){
           $('#login').addClass('error');
           $('p.error-description').html("Неверный логин");
       }
       else if( jqXHR.responseText==='error: wrong password'){
           $('#pass').addClass('error');
           $('p.error-description').html("Неверный пароль");
       }
       else {
           console.log('Error: Server is not responding ' + textStatus);
           window.location.pathname = '/server-failed';
       }
    });
    
    return false;
}

function hide(){
    $('.fixed-overlay').fadeOut();
    window.location.hash = "";
}
