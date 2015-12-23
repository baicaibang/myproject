
function Myselect () {
	$(".selectbox").each(function(){
		$(this).find(".common_select").css('width',$(this).width()-22);
		$(this).find(".common_option").css('width',$(this).width()-2);
	});
	$(".selectbox").find(".common_select").click(function(e) {
		$(".common_option").hide();
		$(this).parent().find(".common_option").toggle();
		e=e||window.event;
		e.stopPropagation();
	});
	$(document).click(function() {
		$(".selectbox").find(".common_option").hide();
	});
	$(".selectbox div").click(function() {
		var index = $(this).index();
		var x = $(this).text();
		$(this).parent().siblings(".common_select").html(x);
		var value = $(this).attr('selectValue');
		$(this).parent().siblings(".common_select").attr('selectValue',value);
	});

}