var path_id = undefined;
var last_displayed_ranking = {};

function getPathId() {
    if (path_id == undefined) {
        path_id = getIdFromURL('path_id', 10030);
    }
    return path_id;
}
function loadWorldwideRanking(maxRank, path_id, countryCode, tag, minBirthYear, maxBirthYear) {
    last_displayed_ranking = {
        maxRank: maxRank, path_id: path_id, countryCode: countryCode, tag: tag,
        minBirthYear: minBirthYear, maxBirthYear: maxBirthYear
    }
    $('#worldwideRankingsOut').html('');
    var data = {};
    if (maxRank) {
      data['maxRank'] = maxRank;
    }
    if (path_id) {
      data['path_id'] = path_id;
    }
    if (countryCode) {
      data['countryCode'] = countryCode;
    }
    if (tag) {
      data['tag'] = tag;
    }
    if (minBirthYear) {
      data['minBirthYear'] = minBirthYear;
    }
    if (maxBirthYear) {
      data['maxBirthYear'] = maxBirthYear;
    }
    // worldwide ranking
    ajax({
        url: '../jsonapi/worldwide_ranking',
        data: data,
        success: function(rankings) {
            var s = '<table class="worldwideRankings">';
            for(var i in rankings.rankings) {
                var p = rankings.rankings[i];
                var burl = (p.badge && p.badge.url) ? p.badge.url : '';
                burl = burl.replace(/^\/static/, "../static");
                var flagUrl = '../static/flags/singPath_on.png';
                if (p.playerCountry && p.playerCountry.flagUrl) {
                    flagUrl = p.playerCountry.flagUrl.replace(/^\/static/, "../static");
                }
                var rankImage = p.rank;
                if (parseInt(p.rank) < 100) {
                    rankImage = '<img alt="'+p.rank+'" src="_images/commonButtons/numbers/number'+lpad2(p.rank)+'.png"/>';
                }
                var onclick = 'onclick="showProfilePopup(' + p.playerid + ')"';
                s += '<tr class="worldwideRankings">' +
                     '<td class="worldwideRankingsRank">' + rankImage + '</td>' +
                     '<td class="worldwideRankingsGravatar"><img ' + onclick +
                         ' src="' + p.gravatar + '" class="worldwideRankingsGravatar"/></td>' +
                     '<td class="worldwideRankingsNickname"><font '+onclick+'>' +
                         p.nickname + '</font></td>'+
                     '<td class="worldwideRankingsFlag"><img src="' + flagUrl +
                         '" class="worldwideRankingsFlag" /></td>'+
                     '<td class="worldwideRankingsBadge">'+
                         (burl ? '<img src="' + burl + '" class="worldwideRankingsBadge" />' : '')+
                     '</td>'+
                     '<td class="worldwideRankingsSolved">' + p.solved_num + '</td>'+
                     '</tr>';
            }
            s += '</table>';
            if (!rankings.rankings || rankings.rankings.length == 0) {
              s = '<br/><br/>No one from this country has played this path'
              if (tag) {
                  s += ' with the "'+tag+'" tag'
              }
            }
            $('#worldwideRankingsOut').html(s);
            if (rankings['path'] && rankings['path']['description']) {
              s = rankings['path']['description'];
            } else {
              s = 'Welcome to the Worldwide Ranking page!';
            }
            $('#levMBText').html(s);
        }
    });
}
function loadPlayerWorldwideRanking() {
  var countryCode = undefined;
  var tag = getParameterFromURL('tag');
  var minBirthYear = getIdFromURL('minBirthYear');
  var maxBirthYear = getIdFromURL('maxBirthYear');
  var maxRank = getIdFromURL('maxRank', 25);
  return loadWorldwideRanking(maxRank, path_id, countryCode, tag, minBirthYear, maxBirthYear);
}
function loadPlayerCountryRanking() {
  return loadCountryRanking($("#playerCountryCode")[0].value, $("#playerCountryName")[0].value);
}
function loadCountryRanking(countryCode, countryName) {
  displayTab($('#playerCountry')[0], 0);
  if (!countryName) {
    countryName = 'Unknown';
  }
  $('#playerCountry').html(countryName); //set tab name
  var tag = getParameterFromURL('tag');
  var minBirthYear = getIdFromURL('minBirthYear');
  var maxBirthYear = getIdFromURL('maxBirthYear');
  var maxRank = getIdFromURL('maxRank', 25);
  return loadWorldwideRanking(maxRank, path_id, countryCode, tag, minBirthYear, maxBirthYear);
}
function refreshCurrentTab() {
    loadWorldwideRanking(
        last_displayed_ranking['maxRank'],
        path_id,
        last_displayed_ranking['countryCode'],
        last_displayed_ranking['tag'],
        last_displayed_ranking['minBirthYear'],
        last_displayed_ranking['maxBirthYear']
    );
}
function setLanguage(pathid) {
    $('#languageSelector span.smallToggleButton').each(function(elem){
        $(this).removeClass('on');
        var id = this.id;
        if (parseInt(pathid) == parseInt(id)) {
            $(this).addClass('on');
        }
    });
    path_id = pathid;
    refreshCurrentTab();
}
function loadLanguageSelector() {
    ajax({
        url: '../jsonapi/get_game_paths',
        success: function(result) {
            var on = '';
            if (parseInt(path_id) == 0) {
                on = 'on';
            }
            var s = '<span class="smallToggleButton '+on+'" id="0" '+
                'onclick="setLanguage(0)">All</span>';
            var paths = result.paths;
            for (var i in paths) {
                var path = paths[i];
                on = '';
                if (parseInt(path_id) == parseInt(path.id)) {
                    on = 'on';
                }
                s += '<span class="smallToggleButton '+on+'" id="'+path.id+'" '+
                    'onclick="setLanguage('+path.id+')">'+path.name+'</span>';
            }
            $('#languageSelector').html(s);
        }
    });
}

function SelectTag(){
	var tag=getParameterFromURL('tag',false);
	if(tag)
		$('#tourInfoBoxTagDropDown').html(tag);
}

$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    
    // Ivan, Note: Function was updated in LogAccessCtrl():controllers.js
    // log_access('ranking');
    
    path_id = getPathId();
    loadPlayerData(function(player) {
      var countryCode = 'SG';
      var country = 'Singapore';
      if (player.countryCode) {
        countryCode = player.countryCode;
        country = player.country;
      }
      $('#playerCountryCode').val(countryCode); //store player's country code
      $('#playerCountryName').val(country); //store player's country name
      loadPlayerCountryRanking();
      if (player.error) {
        showJanrainLoginBox();
      }
    }, true);
    loadLanguageSelector();
    autoPreloadRollsImages();
    initRolls();
    showAdv();
    SelectTag();
});
