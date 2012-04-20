$(document).ready(function() {
	// player data
	$.ajax({
		url: 'http://15.latest.singpath.appspot.com/jsonapi/player?callback=?',
		dataType: 'json',
		success: function(player) {
			$('#logIndetailsNameText').append(player.nickname);
			$('#hpProfileNameText').append(player.nickname);
		}
	});
	// ranking data
	$.ajax({
		url: 'http://15.latest.singpath.appspot.com/jsonapi/ranking/path/10030?callback=?',
		dataType: 'json',
		success: function(rankings) {
			for(i in rankings) {
				x = parseInt(i);
				x = x + 1;
				$('#topRankings').append('<div id="tpNo' + x + 'Info">' + '<div id="tpNo' + x + 'NumDetails">' + rankings[i].ranknum + '</div><div id="tpNo' + x + 'Gravatar"><img src="' + rankings[i].gravatar + '" /></div><div id="tpNo' + x + 'Details">' + rankings[i].name + '</div><div id="tpNo' + x + 'BadgesZone"><img src="' + rankings[i].badgeURL + '" /></div>' + '</div>' );
				$('#levTopRankings').append('<div id="levTpNo' + x + 'Info">' + '<div id="levTpNo' + x + 'NumDetails">' + rankings[i].ranknum + '</div><div id="levTpNo' + x + 'Gravatar"><img src="' + rankings[i].gravatar + '" /></div><div id="levTpNo' + x + 'Details">' + rankings[i].name + '</div><div id="levTpNo' + x + 'BadgesZone"><img src="' + rankings[i].badgeURL + '" /></div>' + '</div>' );
			}
		}
	});
	$.ajax({
		url: 'http://15.latest.singpath.appspot.com/jsonapi/player?callback=?',
		dataType: 'json',
		success: function(player) {
			$('#logIndetailsNameText').append(player.nickname);
			$('#hpProfileNameText').append(player.nickname);
		}
	});
});