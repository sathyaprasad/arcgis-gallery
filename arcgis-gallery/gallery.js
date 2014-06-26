$(document).ready(function() {
	$('#settings').on('click', function() {
		$('#button-bar').css('display', 'inline-block');
	});

	$('#button-bar > a').on('click', function() {
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		}
		else {
			$(this).addClass('selected');
		}
	});
});