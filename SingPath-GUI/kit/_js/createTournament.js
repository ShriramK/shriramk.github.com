function showcTab(index) {
    _showTab($('table.tabHeader td')[0], index, 'div.levels', 'div.myPaths', 'div.otherPaths');
    
}

function showqTab(index) {
	_showTab($('table.tabHeader2 td')[0], index, 'div#solution', 'div#skeleton');
} 
function clickItem(selector){
	console.log(selector);
	if($(selector).hasClass('active'))
		$(selector).removeClass('active');
	else
		$(selector).addClass('active');
}

$(document).ready(function(){
	$('.tcLevelItem, .tcProblemItem, .roundProblemItem').click(function(){
		clickItem(this);
	});
});
