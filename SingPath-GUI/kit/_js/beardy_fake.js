// written for SingPath by Kenny Shen (www.northpole.sg)

function beardy() {
	// image rolls
	$(".rolls img").hover(
	 function()
	 {
	  this.src = this.src.replace("_off","_on");
	 },
	 function()
	 {
	  this.src = this.src.replace("_on","_off");
	 }
	);
	// Template render
    var json;
	// Temp toggle live/static
	function getUrlVars()
	{
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	}
	var toggleParams = getUrlVars();
	var myJSON = "";
	if (toggleParams == 'test') {
		myJSON = "http://15.latest.singpath.appspot.com/jsonapi/temp_for_kenny?callback=?";
	}
	else {
		myJSON = "/jsondata/";
	}
    json = $.getJSON(myJSON, function(data) {
		// JSONP test
		if(!data) {
			return;	// fail silently
		}
		// Check if user exists
		if(data.user) {
			$('#logIndetailsNameText').append(data.user[0].current_name);
			$('#hpProfileNameText').append(data.user[0].current_name);
			$('#hpProfileDetails').append('Location: ' + data.user[0].current_location + '<br> Age: ' + data.user[0].current_age);
			$('#hpTopRankingDetails').append(data.user[0].ranking);
			$('#hpGravatarLarge').append('<img src="' + data.user[0].gravatar + '" />');
			$('#logInGravatarPhoto').append('<img src="' + data.user[0].gravatar + '" width="40" height="40" />');
			// Check if user has achievements
			if(data.user[1]) {
				//alert(data.user[1].achievements[1].achievement);
				for (i in data.user[1].achievements) {
					x = parseInt(i);
					x = x + 1;
					$('#homeAchievements').append('<div id="homeAchNo' + x + '">' + data.user[1].achievements[i].achievement + '</div>');
				}
			}
		}
		if(data.toprankings) {
			for(i in data.toprankings) {
				x = parseInt(i);
				x = x + 1;
				$('#topRankings').append('<div id="tpNo' + x + 'Info">' + '<div id="tpNo' + x + 'NumDetails">' + data.toprankings[i].ranknum + '</div><div id="tpNo' + x + 'Gravatar"><img src="' + data.toprankings[i].gravatar + '" /></div><div id="tpNo' + x + 'Details">' + data.toprankings[i].name + '</div><div id="tpNo' + x + 'BadgesZone"><img src="' + data.toprankings[i].badgeURL + '" /></div>' + '</div>' );
				// Additional render (to be consolidated once Shane rewrites his CSS)
				$('#levTopRankings').append('<div id="levTpNo' + x + 'Info">' + '<div id="levTpNo' + x + 'NumDetails">' + data.toprankings[i].ranknum + '</div><div id="levTpNo' + x + 'Gravatar"><img src="' + data.toprankings[i].gravatar + '" /></div><div id="levTpNo' + x + 'Details">' + data.toprankings[i].name + '</div><div id="levTpNo' + x + 'BadgesZone"><img src="' + data.toprankings[i].badgeURL + '" /></div>' + '</div>' );
			}
		}
		if(data.current_path) {
			$('#pCPTextTitle').append(data.current_path[0].title);
			$('#pCPText').append(data.current_path[0].sub_title + '<br>' + data.current_path[0].description)
			$('#pMBText').append('You are currently playing ' + data.current_path[0].game_total + 'games! You have ' + data.current_path[0].game_step + ' out of ' + data.current_path[0].game_total + '.<br>The last answer was ' + data.current_path[0].previous_answer);
			// Output example code
			for(i in data.current_path[0].example_code) {
				$('#pEMText').append(data.current_path[0].example_code[i].code + '<br>' + data.current_path[0].example_code[i].result + '<br><br>');
			}
			// Output error message
			$('#pErrorMessage').append('<div id="pErMText">'+ data.current_path[0].error_message + '</div>');
		}
		if(data.current_level) {
			$('#gameCLTextTitle').append(data.current_level[0].title);
			$('#gameCLText').append(data.current_level[0].description);
			$('#gameMBText').append('Well done! You got ' + data.current_level[0].game_step + ' out of ' + data.current_level[0].game_total +'.<br>The last answer was: ' + data.current_level[0].previous_answer);
			// If game list is available
			if(data.current_level[0].gamelist) {
				for(i in data.current_level[0].gamelist) {
					$('#gameGCText').append(data.current_level[0].gamelist[i].title + '<br>');
					$('#gameGCContributedText').append(data.current_level[0].gamelist[i].contributor + '<br>');
				}
			}
		}
		if(data.news_bytes) {
			for(i in data.news_bytes) {
				x = parseInt(i);
				x = x + 1;
				$('#rankingInformation').append('<div id="raIn' + x + 'Info>' + data.news_bytes[i].content + '</div>');
			}
		}
		if(data.country_rankings) {
			for(i in data.country_rankings) {
				x = parseInt(i);
				x = x + 1;
				$('#rankingCountryTop10List').append('<div id="raCT10info' + x + '"><div id="raCT10NumDetails' + x +'">' + x + '.</div>' + '<div id="raCT10Flag' + x + '"><img src="' + data.country_rankings[i].flagURL + '" /></div><div id="raCT10Details' + x + '">' + data.country_rankings[i].name + '</div><div id="raCT10NumPeople' + x + '">' + data.country_rankings[i].users + '</div>'  + '</div>');
			}
		}
		if(data.worldwide_rankings) {
			for(i in data.worldwide_rankings) {
				x = parseInt(i);
				x = x + 1;
				$('#rankingWorldWideList').append('<div id="raWWLInfo' + x + '">' + '<div id="raWWLInfo' + x + 'NumDetails">' + x + '.</div><div id="raWWLInfo' + x + 'Gravatar"><img src="' + data.worldwide_rankings[i].gravatar  + '" /></div><div id="raWWLInfo' + x + 'Details">' + data.worldwide_rankings[i].name + '<br>' + data.worldwide_rankings[i].location + '</div>' + '<div id="raWWLInfo' + x + 'CountryZone"><img src="' + data.worldwide_rankings[i].flagURL + '" /></div><div id="raWWLInfo' + x + 'BadgesZone"><img src="' +  data.worldwide_rankings[i].badgeURL + '" /></div><div id="raWWLInfo' + x + 'Solved">' + data.worldwide_rankings[i].qnsSolved + '</div>' + '</div>')
			}
		}
	});
}
