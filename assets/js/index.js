/**
 * Created by chuandong on 15/12/17.
 */

var counter = 0;

setInterval(function(){
    counter += 1;

    $("#chuan-title").fadeOut(1000, function() {
        switch (counter % 6) {
            case 0:
                $("#chuan-title").html("Chuan is a Cool Boy :P");
                break;
            case 1:
                $("#chuan-title").html("Chuan is a Software Engineer");
                break;
            case 2:
                $("#chuan-title").html("Chuan is a Web Developer");
                break;
            case 3:
                $("#chuan-title").html("Chuan is an Android Engineer");
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

}, 3000);