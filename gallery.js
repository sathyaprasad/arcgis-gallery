var criteriaMap;

$(document).ready(function() {
	// start from the first image.	

	var clickEvent = ('ontouchstart' in window ? 'touchend' : 'click');

	getResultsFromServer(0, null);

	$('body > *').on(clickEvent, function(e) {
		var searchContainer = $('#advanced-search');
		var filterContainer = $('#filter');
		var filterToggle = $('#filter-toggle');
		var inputContainer = $('#search-bar > input');
		if($('#advanced-search').hasClass('expanded') && !searchContainer.is(e.target) && !inputContainer.is(e.target) && searchContainer.has(e.target).length == 0) {
			$('#sort-bar > a.selected').removeClass('selected');
			$('#overlay').hide();
			$('#advanced-search').removeClass('expanded');
			$('#advanced-search').hide();
			$('#sort-bar').show();
			$('#search-bar > input').removeClass('advanced');
			$('#search-bar > h3').removeClass('advanced');
			$('#search-bar').removeClass('advanced');
		}	
		else if($('#filter').hasClass('expanded') && !filterContainer.is(e.target) && !filterToggle.is(e.target) && filterToggle.has(e.target).length == 0 && filterContainer.has(e.target).length == 0) {
			$('#filter').hide();
			$('#filter').removeClass('expanded');
		}	
	});

	$(window).scroll(function() {
		var searchEl = '#search';
		if($(window).scrollTop() == 0) {
			$(searchEl).css('position', 'static');
		}
		else {
			$(searchEl).css('position', 'fixed');
		}
	});

	$('#settings').on(clickEvent, function() {
		var selected = 'advanced-selected';
		/*if($('#advanced-search').hasClass(selected)) {
			$('#advanced-search').removeClass(selected);
			$('#advanced-search').hide();
			$('#overlay').hide();
		}
		else {
			$('#advanced-search').addClass(selected);
			$('#advanced-search').show();
			$('#overlay').show();
		}*/		
	});	

	$('#advanced-rating > a').on(clickEvent, function() {		
		$('#advanced-rating > a.selected').removeClass('selected');
		$(this).addClass('selected');
	});

	$('#advanced-type > a').on(clickEvent, function() {		
		$('#advanced-type > a.selected').removeClass('selected');
		$(this).addClass('selected');
	});

	$('#advanced-date > a').on(clickEvent, function() {		
		$('#advanced-date > a.selected').removeClass('selected');
		$(this).addClass('selected');
	});

	$('#sort-bar > a').on(clickEvent, function() {		
		$('#sort-bar > a.selected').removeClass('selected');
		$(this).addClass('selected');
	});

	$('#search-bar > input').on(clickEvent, function() {
		$('#search-bar').addClass('advanced');
		$('#search-bar > h3').addClass('advanced');
		$('#search-bar > input').addClass('advanced');		
		$('#advanced-search').show();
		$('#sort-bar').hide();
		$('#advanced-search').addClass('expanded');
		$('#overlay').show();
	});

	$('#search-bar > input').bind('keypress', function(e) {
		var term = $('#search-bar > input').val();
		var keycode = e.keyCode;
		if(keycode == 13) {		
			// clear out existing, show loading	
			$('#content-items').hide();
			$('#content-searching').show();
			$('#sort-bar').show();
			$('#search-bar > input').removeClass('advanced');
			$('#search-bar > h3').removeClass('advanced');
			$('#search-bar').removeClass('advanced');
			$('#sort-bar > a.selected').removeClass('selected');
			$('#overlay').hide();
			$('#advanced-search').removeClass('expanded');
			$('#advanced-search').hide();
			search(term);
			$('#sort-bar > a.selected').removeClass('selected');
			
		}
	});

	$('#views').on(clickEvent, function() {
		sort('mostViews');
		$('.item-body > h6.displayed').removeClass('displayed');
		$('.item-views').addClass('displayed');
	});
	$('#alphabetic').on(clickEvent, function() {
		sort('alphabetic');
		$('.item-body > h6.displayed').removeClass('displayed');
		$('.item-author').addClass('displayed');
	}); 
	$('#rating').on(clickEvent, function() {
		sort('rating');
		$('.item-body > h6.displayed').removeClass('displayed');
		$('.item-rating').addClass('displayed');
	});
	$('#freshest').on(clickEvent, function() {
		sort('dateRevisedOrUploaded');
		$('.item-body > h6.displayed').removeClass('displayed');
		$('.item-created').addClass('displayed');
	});

	$('#filter-toggle').on(clickEvent, function() {
		// show the filter screen.
		$('#filter').show();
		$('#filter').addClass('expanded');
	});

	$('.filter-row > a').on(clickEvent, function(e) {	
		prepareFilter(e, false);
	});

	$('#filter-author > select').change(function(e) {
		prepareFilter(e, true);
	});

	function prepareFilter(e, isDropdown) {
		// take whatever is e's parent and get rid of selected from all its siblings.	
		var parent = $(e.target).parent()[0];
		var parentId = $(parent).attr('id');
		$('#sort-bar > a.selected').removeClass('selected');
		
		$('#content-searching').show();
		$('#content-items').hide();

		if(!criteriaMap) {
			criteriaMap = {};
		}

		var filterGroup = parentId;
		var value;
		if(isDropdown) {
			var id = $(e.target).attr('id');
			value = $('#' + id + ' option:selected').text();
		}
		else {
			value = $(e.target).html();
		}

		if($(e.target).hasClass('filtered')) {
			delete criteriaMap[filterGroup];
		}
		else {
			criteriaMap[filterGroup] = {'filterGroup': filterGroup, 'value': value};
		}
		if($('#' + parentId + ' > a.filtered')[0] != $(e.target)[0]) {
			$(e.target).addClass('filtered');
		}
		else {
			$(e.target).removeClass('filtered');
		}
		filter(criteriaMap);	
		// if they're the same, then don't add it here.
	}

	$('#clear-filter').on(clickEvent, function() {
		$('.filter-row > a.filtered').removeClass('filtered');
		$('#content-items').hide();
		$('#content-searching').show();
		filter({});
		$('#sort-bar > a.selected').removeClass('selected');
	});

	$('#advanced-search-action').on(clickEvent, function() {
		$('#sort-bar > a.selected').removeClass('selected');
		$('#content-searching').show();
		$('#content-items').hide();
		$('#overlay').hide();
		$('#advanced-search').hide();
		$('#sort-bar').show();
		$('#advanced-search').removeClass('expanded');
		$('#search-bar > input').removeClass('advanced');
		$('#search-bar > h3').removeClass('advanced');
		$('#search-bar').removeClass('advanced');
		var queryStr = prepareAdvancedSearch();
		getResultsFromServer(0, queryStr);
	});
});

