jQuery(document).ready(function($) {
    $('<div class="style-container">'+
        '<ul class="pre-styles">'+
        '<li class="default"></li>'+
        '<li class="purple"></li>'+
        '<li class="red"></li>'+
        '<li class="blue"></li>'+
        '<li class="cyan"></li>'+
        '<li class="yellow"></li>'+
        '</ul>'+
        '<div id="demo-custom"><i class="icon-gear icon-spin"></i><h4>Color styles</h4></div>'+
        '</div>').appendTo('body');  

    $(".style-container li").click(function(){
        var selected = $(this).attr('class'),
            style='css/styles/'+selected+'.css';
        $('#theme-style').attr('href',style);
        return false;
    });

    
    $("#demo-custom").click(function(){
        if($(".style-container").css('right') == '0px'){
            $(".style-container").stop().animate({right:'-205px'},300);
        }
        if($(".style-container").css('right') == '-205px'){
            $(".style-container").stop().animate({right:'0px'},300);
        }
    });

});

