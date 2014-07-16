var rawResults = [];
var currentHtml = [];
var authorArray = [];
var lastFilterGroup = '';
var currentIndex = 0;
var numShow = 100;
var itemWidth = 250;
var gutterWidth = 20;
var authors = {};
var masonry;

function getResultsFromServer(startIndex, queryTerm) {
	//var jsonUrl = 'http://www.arcgis.com/sharing/rest/search?num=100&start=' + startIndex + '&sortField=numViews&sortOrder=desc&q=all&type=Web%20Map%20Application&f=json';
	var term = '';
	if(queryTerm == null || queryTerm == '') {
		term = 'all';
	}
	else {
		term = queryTerm;
	}
	var jsonUrl = 'http://www.arcgis.com/sharing/rest/search?q=' + term + '&num=' + numShow + '&f=json';
	$.getJSON(jsonUrl, function(data) {
		calculateContainerWidth();				
		rawResults = data.results;
		var htmlList = arrayToHtmlList(data.results);
		$('#content-searching').hide();
		$('#content-items').show();
		createMasonry(htmlList);
	});
}

function calculateContainerWidth() {
	var itemAndGutter = itemWidth + gutterWidth;
	var containerWidth = $('#content').width();
	var numCols = parseInt(containerWidth / itemAndGutter);
	// total width: number of columns times the width of an item and its gutter to one side, minus one gutter total.
	var actualContainerWidth = numCols * itemAndGutter - gutterWidth;
	$('#content-items').css('width', actualContainerWidth.toString());
}

function arrayToHtmlList(results) {
	var htmlList = [];
	if(results) {
		//rawResults = results;
	}
	$.each(results, function(index, value) {
		// http://www.arcgis.com/sharing/rest/content/items/a842e359856a4365b1ddf8cc34fde079/info/thumbnail/world_boundaries_places.jpg
		//var imgPath = 'http://www.arcgis.com/sharing/rest/content/items/' + value.id + '/info/' + thumbnailPath;		
		var htmlItem = buildOutHtmlItem(value);			
		authors[value.owner] ? authors[value.owner] += 1 :  authors[value.owner] = 1;
		htmlList.push(htmlItem);
	});
	sortAuthorsByOutput();
	populateAuthorDropdown();
	return htmlList.join('');
}

function createMasonry(htmlList) {
	var container = $('#content-items');
	$(container).html(htmlList);

	if(masonry) {
		masonry.reloadItems();
	}
	container.masonry({
		columnWidth: itemWidth,
		gutter: gutterWidth,
		itemSelector: '.item'
	});	
	masonry = container.data('masonry');	
}

function buildOutHtmlItem(itemValue) {	
	var color = chooseTileColor(itemValue.type);
	var dateStr = prettyDate(itemValue.created);
	var snippetTxt = formatSnippet(itemValue.snippet);
	var title = formatTitle(itemValue.title);
	var numViews = formatNumViews(itemValue.numViews);
	var ratingStars = formatRating(parseInt(itemValue.avgRating));
	var mapItemHtml =   '<div class="item" style="width:' + itemWidth + 'px;background:' + color + '">' + 
							'<div class="item-title">' +
								'<h4>' + title + '</h4>' +
							'</div>' +
							'<div class="item-body">' + 
								'<p>' + snippetTxt + '</p>' + 								 
								'<h6 class="item-author">By ' + itemValue.owner + '</h6>' + 
								'<span class="separator"></span>' +
								ratingStars + 
								'<span class="separator"></span>' +
								'<h6 class="item-created displayed">' + dateStr + '</h6>' +
								'<span class="separator"></span>' +
								'<h6 class="item-views displayed">Views: ' + numViews + '</h6>' +
								'<span class="separator"></span>' +
								'<h6 class="item-type displayed">' + itemValue.type + '</h6>' + 
							'</div>' + 
						'</div>';
	currentHtml.push(mapItemHtml);
	return mapItemHtml;	
}

function formatRating(numStars) {
	var starHtml = '';
	for(var i=0; i < numStars; i++) {
		starHtml += '<div class="rating-star"></div>';
	}
	if(numStars == 0) {
		starHtml = '<h6>not rated</h6>';
	}
	return starHtml;
}

function formatNumViews(rawNum) {
	var numViews = '0';
	if(rawNum > 1000000) {
		numViews = (rawNum / 1000000).toFixed(0) + 'm';
	}
	else if(rawNum > 1000) {
		numViews = (rawNum / 1000).toFixed(0) + 'k';
	}
	else {
		numViews = rawNum.toString();
	}
	return numViews;
}

function formatTitle(rawTitle) {
	var title = rawTitle.replace(/[\._]/g, ' ');
	return title;
}

function chooseTileColor(type) {
	var color = '#AA8888';
	if(type == 'Map Service') {
		color = '#88AAAA';
	}
	else if(type == 'Web Map') {
		color = '#88AA88';
	}
	else if(type == 'Web Mapping Application') {
		color = '#AAAA88';
	}
	else if(type == 'Feature Service') {
		color = '#8888AA';
	}
	return color;
}

function formatDate(created) {
	var monthDate = new Date(created);
	var dateStr = '';
	if(monthDate != null) {
		dateStr = monthDate.getMonth() + '/' + monthDate.getFullYear();
	}
	return dateStr;
}

function prettyDate(val){

	var date = null;

	if(typeof val == "number") {
		date = new Date(val);
	} else {
		date = new Date((val || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
	}
    
    if (!date || isNaN(date.getTime())) {
        date = new Date(val || "");
    }
    
    var diff = (((new Date()).getTime() - date.getTime()) / 1000), day_diff = Math.floor(diff / 86400);
    
    
    if (isNaN(day_diff) || day_diff < 0) {
        return;
    }
    
    return (day_diff === 0 &&
    (diff < 10 && "just now" ||
    diff < 20 && "10 secs ago" ||
    diff < 30 && "20 secs ago" ||
    diff < 40 && "30 secs ago" ||
    diff < 90 && "1 minute ago" ||
    diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
    diff < 7200 && "1 hour ago" ||
    diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
    day_diff == 1 && "Yesterday" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil(day_diff / 7) + (Math.ceil(day_diff / 7) == 1 ? " week ago" : " weeks ago") ||
    day_diff < 365 && Math.ceil(day_diff / 30) + (Math.ceil(day_diff / 30) == 1 ? " month ago" : " months ago") ||
    day_diff < 730 && day_diff / 365 && " 1 year ago" || 
    day_diff < 1095 && day_diff / 730 && " 2 years ago" || 
    day_diff < 1460 && day_diff / 1095 && " 3 years ago" || 
    day_diff < 1825 && day_diff / 1460 && " 4 years ago" ||
    day_diff < 2190 && day_diff / 1825 && " 5 years ago" ||  
    "more than 5 years ago");
}

function populateAuthorDropdown() {
	for(var i=0; i < authorArray.length; i++) {
		$('#authors-dropdown').append('<option value="' + authors[authorArray[i]] + '">' + authorArray[i] + '</option>');
	}
}

function sortAuthorsByOutput() {
	for(var key in authors) {
		authors[key].key = key;
		authorArray.push(key);
	}

	authorArray.sort(function(a,b) {
		return(a - b);
	});
}

function formatSnippet(snippet) {
	var maxNumChars = 250;
	var snippetTxt = '';
	if(snippet == null || snippet == '') {
		snippetTxt = '';
	}
	else if(snippet.length < maxNumChars) {
		snippetTxt = snippet;
	}
	else {
		snippetTxt = snippet.substring(0, maxNumChars) + '...';
	}
	return snippetTxt;
}

function createFilteredList(criteriaMap) {
	var tempList = [];
	tempList = rawResults;

	for(var m in criteriaMap) {
		var filterGroup = criteriaMap[m].filterGroup;
		
		switch(filterGroup) {
			case 'filter-author':
				tempList = filterByAuthor(tempList, criteriaMap[m].value);
				break;
			case 'filter-custom':
				tempList = filterByCustomAttr(tempList, criteriaMap[m].value);
				break;
			case 'filter-date':
				tempList = filterByDate(tempList, criteriaMap[m].value);
				break;
			case 'filter-type':
				tempList = filterByType(tempList, criteriaMap[m].value);
				break;
			case 'filter-rating':
				tempList = filterByRating(tempList, criteriaMap[m].value);
				break;
			default:
				break;
		}
	}	
	return tempList;
}


function filterByCustomAttr(tempList, value) {
	var filteredList = [];
	if(value == 'By ESRI') {
		for(var i=0; i < tempList.length; i++) {
			if(tempList[i].owner == 'esri') {
				filteredList.push(tempList[i]);
			}
		}
	}
	else if(value == 'Top 5 Authors') {
		var topAuthors = authorArray.slice(0, 5);
		for(var i=0; i < tempList.length; i++) {
			for(var j=0; j < topAuthors.length; j++) {
				if(tempList[i].owner == topAuthors[j]) {
					filteredList.push(tempList[i]);
				}
			}
		}
	}
	else if(value == 'Most Popular') {
		// rules: anything from 1k views and up and 3 stars and above.
		var filteredList = [];
		for(var i=0; i < tempList.length; i++) {
			if(tempList[i].avgRating >= 3.0 && tempList[i].numViews >= 1000) {
				filteredList.push(tempList[i]);
			}
		}
	}
	else if(value == 'Most Commented') {
		// the 50 most-commented results.
		// find 50 most-commented
		// return results
		var filteredList = [];
		var mostCommentedArr = sortMostCommented(tempList);
		var filteredList = mostCommentedArr.slice(0, 50);
	}
	return filteredList;
}

function sortMostCommented(tempList) {
	tempList.sort(function(a,b) {
		if(a.numComments < b.numComments) {
			return 1;
		}
		else if(a.numComments > b.numComments) {
			return -1;
		}
		else {
			return 0;
		}
	});
	return tempList;
}

function filterByRating(tempList, value) {
	var filteredList = [];
	var topLimit = 0;
	var bottomLimit = 0;
	if(value == '4 - 5') {
		topLimit = 5.0;
		bottomLimit = 4.0;
	}
	else if(value = '3 - 4') {
		topLimit = 3.9999;
		bottomLimit = 3.0;
	}
	for(var i=0; i < tempList.length; i++) {
		if(tempList[i].avgRating >= bottomLimit && tempList[i].avgRating <= topLimit) {
			filteredList.push(tempList[i]);
		}
	}
	return filteredList;
}

function filterByAuthor(tempList, value) {
	var filteredList = [];
	for(var i=0; i < tempList.length; i++) {
		if(value == tempList[i].owner) {
			filteredList.push(tempList[i]);
		}
	}
	return filteredList;
}

function filterByType(tempList, value) {
	var type = value;
	if(type == 'Web Mapping App') {
		type = 'Web Mapping Application';
	}

	var filteredList = [];
	for(var i=0; i < tempList.length; i++) {
		if(type == 'Other') {
			if(tempList[i].type != 'Web Map' && tempList[i].type != 'Map Service' && tempList[i].type != 'Web Mapping Application' && tempList[i].type != 'Feature Service') {
				filteredList.push(tempList[i]);
			}
		} 
		else {
			if(type == tempList[i].type) {
				filteredList.push(tempList[i]);
			}
		}
	}

	return filteredList;
}

function filterByDate(tempList, value) {
	var oldDate = 0;
	var currentTime = new Date().getTime();
	var millisecondsInMonth = 2629740000;		
	var millisecondsInYear = 31556900000;
	var millisecondsInHalfYear = millisecondsInYear / 2;
	var millisecondsInFiveYears = millisecondsInYear * 5;
	// find the differences.
	if(value == 'This Month') {
		oldDate = millisecondsInMonth;
	}
	else if(value == 'Last 6 Months') {
		oldDate = millisecondsInHalfYear;
	}
	else if(value == 'This Year') {
		oldDate = millisecondsInYear;
	}
	else if(value == 'Last 5 Years') {
		oldDate = millisecondsInFiveYears;
	}
	var dateCutoff = currentTime - oldDate;

	// for each item, if date is greater than this, we're good.
	var filteredList = [];
	for(var i=0; i < tempList.length; i++) {
		if(dateCutoff < tempList[i].created) {
			filteredList.push(tempList[i]);
		}
	}

	return filteredList;
}

function createSortedList(criteria) {
	var tempList = rawResults;
	// array sorting algorithm 
	switch(criteria) {
		case 'mostViews':
			tempList = sortByMostViews(tempList);
			break;
		case 'alphabetic':
			tempList = sortAlphabetic(tempList);
			break;
		case 'rating':
			tempList = sortByRating(tempList);
			break;
		case 'dateRevisedOrUploaded':
			tempList = sortByFreshest(tempList);
			break;
		case 'type':
			tempList = sortByType(tempList);
			break;
		default:
			break;
	}
	return tempList;
}

function sortByMostViews(tempList) {
	tempList.sort(function(a,b) {
		if(a.numViews < b.numViews) {
			return 1;
		}
		else if(a.numViews > b.numViews) {
			return -1;
		}
		else {
			return 0;
		}
	});
	return tempList;
}

function sortByFreshest(tempList) {
	tempList.sort(function(a,b) {
		if(a.created < b.created) {
			return 1;
		}
		else if(a.created > b.created) {
			return -1;
		}
		else {
			return 0;
		}
	});
	return tempList;
}

function sortAlphabetic(tempList) {
	tempList.sort(function(a,b) {
		if(a.title > b.title) {
			return 1;
		}
		else if(a.title < b.title) {
			return -1;
		}
		else {
			return 0;
		}
	});
	return tempList;
}

function sortByType(tempList) {
	tempList.sort(function(a,b) {
		// put all of the 'other' categories in last.
		var aType = a.type;
		var bType = b.type;
		if(a.type != 'Map Service' && a.type != 'Feature Service' && a.type != 'Web Map' && a.type != 'Web Mapping Application') {
			aType = 'zz';
		}
		if(b.type != 'Map Service' && b.type != 'Feature Service' && b.type != 'Web Map' && b.type != 'Web Mapping Application') {
			bType = 'zz';
		}

		if(aType > bType) {
			return 1;
		}
		else if(aType < bType) {
			return -1;
		}
		else {
			return 0;
		}
	});
	return tempList;
}

function sortByRating(tempList) {
	tempList.sort(function(a,b) {
		return b.avgRating - a.avgRating;
	});
	return tempList;
}

function sort(criteria) {
	// build out the second array from the first
	var sortedList = createSortedList(criteria);
	// sort first array
	var htmlList = arrayToHtmlList(sortedList);
	// send this html to the page and to masonry
	createMasonry(htmlList);
}

function filter(criteriaMap) {
	// build out the second array from the first
	var filteredResults = createFilteredList(criteriaMap);
	// sort first array
	var htmlList = arrayToHtmlList(filteredResults);
	// send this html to the page and to masonry
	$('#content-searching').hide();
	$('#content-items').show();
	createMasonry(htmlList);	
}

function search(term) {
	// re-go to the server and bring back a new query.
	getResultsFromServer(0, term);
}

function prepareAdvancedSearch() {
	var queryStr = '';
	var queryArr = [];

	var searchText = $('#search-bar > input').val();
	if(searchText != null && searchText != '') {
		queryArr.push(searchText);
	}

	var rating = prepareRatingQuery('#advanced-rating > .selected');	
	if(rating != null && rating != '') {
		queryArr.push(rating);
	}

	var type = prepareTypeQuery('#advanced-type > .selected');
	if(type != null && type != '') {
		queryArr.push(type);
	}

	var date = prepareDateQuery('#advanced-date > .selected');
	if(date != null && date != '') {
		queryArr.push(date);
	}

	var author = prepareAuthorQuery('#advanced-author > input');
	if(author != null && author != '') {
		queryArr.push(author);
	}

	for(var i=0; i < queryArr.length; i++) {
		if(i > 0) {
			queryStr += ' AND ';
		}
		queryStr += queryArr[i];
	}

	return queryStr;
}

function prepareFilter() {
	var filterArr = [];
	var filterStr = '';

	// get each item.
	var rating = prepareRatingQuery('#filter-rating > .selected');	
	if(rating != null && rating != '') {
		filterArr.push(rating);
	}

	var type = prepareTypeQuery('#filter-type > .selected');
	if(type != null && type != '') {
		filterArr.push(type);
	}

	var date = prepareDateQuery('#filter-date > .selected');
	if(date != null && date != '') {
		filterArr.push(date);
	}

	var author = prepareAuthorQuery('#filter-author > input');
	if(author != null && author != '') {
		filterArr.push(author);
	}

	for(var i=0; i < filterArr.length; i++) {
		if(i > 0) {
			filterStr += ' AND ';
		}
		filterStr += filterArr[i];
	}
	return filterStr;
}

function prepareRatingQuery(element) {
	var queryStr = '';
	// grab all the extra stuff if it exists from the search.
	var selectedRating = $(element);
	//if there is a rating selected
	if(selectedRating.length > 0) {
		var outputStr = '';
		var ratingStr = $(element)[0].innerHTML;
		var ratingNum = 0;
		if(ratingStr == 'Not Rated') {
			outputStr = '0.0';
		}
		else {
			ratingNum = parseInt(ratingStr);
			outputStr = '[' + (ratingNum - 0.5) + ' TO ' + (ratingNum + 0.499999) + ']';
		}

		queryStr = 'avgrating:' + outputStr;
	}
	return queryStr;
}

function prepareTypeQuery(element) {
	var queryStr = '';
	var selectedType = $(element);
	if(selectedType.length > 0) {
		var typeStr = $(element)[0].innerHTML;
		if(typeStr == 'Web Map') {
			//typeStr = 'Web Map NOT Web Mapping Application';
		}
		else if(typeStr == 'Other') {
		}
		queryStr = 'type:' + typeStr; 
	}

	return queryStr;
}

function prepareDateQuery(element) {
	var queryStr = '';
	var selectedDate = $(element);
	if(selectedDate.length > 0) {
		var oldDate = '';
		var dateStr = $(element)[0].innerHTML;

		// get date right now in milliseconds.
		var currentTime = new Date().getTime();
		var millisecondsInMonth = 2629740000;		
		var millisecondsInYear = 31556900000;
		var millisecondsInHalfYear = millisecondsInYear / 2;
		var millisecondsInFiveYears = millisecondsInYear * 5;
		// find the differences.
		if(dateStr == 'This Month') {
			oldDate = millisecondsInMonth;
		}
		else if(dateStr == 'Last 6 Months') {
			oldDate = millisecondsInHalfYear;
		}
		else if(dateStr == 'This Year') {
			oldDate = millisecondsInYear;
		}
		else if(dateStr == 'Last 5 Years') {
			oldDate = millisecondsInFiveYears;
		}
		
		var dateDiff = currentTime - oldDate;

		queryStr = 'uploaded:' + '[' + '000000' + dateDiff + ' TO ' + '000000' + currentTime + ']'; 
	}

	return queryStr;
}

function prepareAuthorQuery(element) {
	var queryStr = '';
	var selectedAuthor = $(element).val();
	if(selectedAuthor != null & selectedAuthor != '') {
		queryStr = 'owner:' + selectedAuthor; 
	}
	return queryStr;
}