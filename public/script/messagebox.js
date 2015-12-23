
function Myalert (title,content) {
	$(".messagebox_fixed").remove();
	var str = "";
	str += "<div class='messagebox_fixed'>";
	str += "<div class='messagebox_box'>";
	str += "<div class='messagebox_title'>"+title+"<div class='messagebox_close' onclick='messagebox_close()'><img src='/images/closezjx.png' style='display: block;'></div></div>";
	str += "<div class='messagebox_content'>"+content+"</div>";
	str += "</div>";
	str += "</div>";
	$("body").append(str);
	$(".messagebox_fixed").fadeIn();
	var boxwidth = $('.messagebox_box').width();
	var boxheight = $('.messagebox_box').height();
	$(".messagebox_box").css('margin-left',-boxwidth/2);
	$(".messagebox_box").css('margin-top',-boxheight/2);
}
function messagebox_close () {
	$(".messagebox_fixed").hide();
}