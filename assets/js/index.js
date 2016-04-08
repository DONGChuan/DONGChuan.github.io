/**
 * Created by chuandong on 15/12/17.
 */

var counter = 0;

setInterval(function(){
    counter += 1;

    $("#chuan-title").fadeOut(1000, function() {
        switch (counter % 6) {
            case 0:
                $("#chuan-title").html("Chuan is so cool, right?");
                break;
            case 1:
                $("#chuan-title").html("Chuan plans to be a Full Stack developer");
                break;
            case 2:
                $("#chuan-title").html("Chuan dreams to be a CTO ");
                break;
            case 3:
                $("#chuan-title").html("Chuan is now fighting with AngularJS");
                break;
            case 4:
                $("#chuan-title").html("Chuan loves animals and traveling");
                break;
            case 5:
                $("#chuan-title").html("Chuan has girlfriend now, so not available :D");
                break;
            default:
                $("#chuan-title").html("Cool Boy");
                break;
        }
    });
    $("#chuan-title").fadeIn(1000);

}, 2000);

// Window Scroll
var windowScroll = function () {
    $(window).scroll(function () {

        var scrollPos = $(this).scrollTop();

        if ($(window).scrollTop() > 70) {
            $('#site-header-id').addClass('site-header-nav-scrolled');
        } else {
            $('#site-header-id').removeClass('site-header-nav-scrolled');
        }

    });
};

$( document ).ready(function() {
    windowScroll();
});