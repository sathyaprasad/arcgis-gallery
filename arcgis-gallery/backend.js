var rawResults = [];
var currentHtml = [];
var currentIndex = 0;
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
	var jsonUrl = 'http://www.arcgis.com/sharing/rest/search?q=' + term + '&num=50&f=json';
	$.getJSON(jsonUrl, function(data) {		
		var htmlList = arrayToHtmlList(data.results);
		createMasonry(htmlList);	
	});
}

function arrayToHtmlList(results) {
	var htmlList = [];
	if(results) {
		rawResults = results;
	}
	$.each(results, function(index, value) {
		// http://www.arcgis.com/sharing/rest/content/items/a842e359856a4365b1ddf8cc34fde079/info/thumbnail/world_boundaries_places.jpg
		//var imgPath = 'http://www.arcgis.com/sharing/rest/content/items/' + value.id + '/info/' + thumbnailPath;		
		var htmlItem = buildOutHtmlItem(value);			
		htmlList.push(htmlItem);
	});
	return htmlList.join('');
}

function createMasonry(htmlList) {
	var container = $('#content-items');
	$(container).html(htmlList);

	if(masonry) {
		masonry.reloadItems();
	}
	container.masonry({
		columnWidth: 200,
		gutter: 20,
		itemSelector: '.item'
	});	
	masonry = container.data('masonry');	
}

function buildOutHtmlItem(itemValue) {	
	var color = chooseTileColor(itemValue.type);
	var dateStr = formatDate(itemValue.created);
	var snippetTxt = formatSnippet(itemValue.snippet);
	var mapItemHtml =   '<div class="item" style="width:200px;background:' + color + '">' + 
							'<h4 class="item-title">' + itemValue.title + '</h4>' +
							'<p>' + snippetTxt + '</p>' + 
							'<h6 class="optional item-author displayed">Author: ' + itemValue.owner + '</h6>' + 
							'<h6 class="optional item-rating">Rating: ' + itemValue.avgRating.toFixed(0) + '</h6>' +  
							'<h6 class="optional item-created">Created: ' + dateStr + '</h6>' +
							'<h6 class="optional item-views">Views: ' + itemValue.numViews + '</h6>' +
							'<h6 class="optional item-type">Type: ' + itemValue.type + '</h6>' + 
						'</div>';
	currentHtml.push(mapItemHtml);
	return mapItemHtml;	
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

function formatSnippet(snippet) {
	var maxNumChars = 144;
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

function createSortedList(criteria) {
	var tempList = rawResults;
	// array sorting algorithm 
	switch(criteria) {
		case 'mostViews':
			tempList = sortByMostViews(tempList);
			break;
		case 'alphabetic':
			templist = sortAlphabetic(tempList);
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

/*
	sort by most views

	put in its place
	while doing, build out html for this as well.
*/

function sort(criteria) {
	// build out the second array from the first
	var sortedList = createSortedList(criteria);
	// sort first array
	var htmlList = arrayToHtmlList(sortedList);
	// send this html to the page and to masonry
	createMasonry(htmlList);
}

function search(term) {
	// re-go to the server and bring back a new query.
	getResultsFromServer(0, term);
}