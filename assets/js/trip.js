/**
 * Created by chuandong on 16/1/17.
 */
var trip1 = new Trip([
    { sel : $(".btn-cv"), content : "Download My CV!", position : "s" },
], {
    showCloseBox : true,
    delay : -1
});

$(document).ready(function(){
    trip1.start();
})