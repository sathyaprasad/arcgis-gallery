$(document).ready(function() {
	// start from the first image.
	getResultsFromServer(0, null);

	/*$('#settings').on('click', function() {
		$('#button-bar').css('display', 'inline-block');
	});*/

	$('#button-bar > a').on('click', function() {		
		$('#button-bar > a.selected').removeClass('selected');
		$(this).addClass('selected');
	});

	$('#search-bar > input').bind('keypress', function(e) {
		var term = $('#search-bar > input').val();
		var keycode = e.keyCode;
		if(keycode == 13) {			
			search(term);
			$('#button-bar > a.selected').removeClass('selected');
		}
	});

	$('#views').on('click', function() {
		sort('mostViews');
		$('.item > h6.displayed').removeClass('displayed');
		$('.item-views').addClass('displayed');
	});
	$('#alphabetic').on('click', function() {
		sort('alphabetic');
		$('.item > h6.displayed').removeClass('displayed');
		$('.item-author').addClass('displayed');
	}); 
	$('#rating').on('click', function() {
		sort('rating');
		$('.item > h6.displayed').removeClass('displayed');
		$('.item-rating').addClass('displayed');
	});
	$('#freshest').on('click', function() {
		sort('dateRevisedOrUploaded');
		$('.item > h6.displayed').removeClass('displayed');
		$('.item-created').addClass('displayed');
	});
	$('#type').on('click', function() {
		sort('type');
		$('.item > h6.displayed').removeClass('displayed');
		$('.item-type').addClass('displayed');
	});

	/*$('#more').on('click', function() {
		// bring back next 35.
		loadImages();
	});*/
});

