var lastHeatID = 0;
var timer_id = undefined;
function loadHeatRanking(heatID, time) {
    lastHeatID = 0;
    $('#heatRankingsOut').html('');
    // heat ranking
    if (!time) {
        time = getParameterFromURL('time');
    }
    var data = {heatID: heatID};
    if (time) {
        data['time'] = time;
    }
    ajax({
        url: '../jsonapi/get_heat_ranking',
        data: data,
        success: function(rankings) {
            var is_anytime = (rankings.tournamentType == 'AnyTime');
            var p;
            var i;
            var j;
            var maxProblemNum = 0;
            for(i in rankings.ranking) {
                p = rankings.ranking[i];
                if (p.total_problems > maxProblemNum) {
                    maxProblemNum = p.total_problems;
                }
            }
            var s = '<table class="heatRankings">';
            s += '<thead>'+
                 '<tr class="heatHeader">'+
                 '<td class="heatRankingsRank" title="Ranking">#</td>'+
                 '<td class="heatRankingsGravatar"></td>'+
                 '<td class="heatRankingsNickname">Player</td>'+
                 '<td class="heatRankingsFlag"></td>'+
                 (!is_anytime ? '<td class="heatRankingsPreviousRank" title="Ranking in previous round">LR</td>' : '')+
                 '<td class="heatRankingsProfessional" title="Professional or Student"></td>';
            for (j = 1; j <= maxProblemNum; j++) {
                s += '<td class="heatRankingUnsolved">'+j+'</td>';
            }
            s +='<td class="heatRankingsFinished">'+
                (is_anytime ? 'Time to finish' : 'Finished') + '</td>'+
                '</tr>'+
                '</thead>';
            var rank = 1;
            s += '<tbody>';
            for(i in rankings.ranking) {
                p = rankings.ranking[i];
                var flagUrl = (p.flagUrl && p.flagUrl != '') ? p.flagUrl : '';
                var previous_rank = (p.previous_rank && p.previous_rank > 0) ? p.previous_rank : '';
                var prof = '';
                if (p.professional == true) {
                    prof = 'Professional';
                } else if (p.professional == false) {
                    prof = 'Student';
                }
                var rankImage = rank;
                if (parseInt(rank) < 100) {
                    rankImage = '<img alt="'+rank+'" src="_images/commonButtons/numbers/number'+lpad2(rank)+'.png"/>';
                }
                var onclick = 'onclick="showProfilePopup(' + p.playerid + ')"';
                s += '<tr class="heatRankings">'+
                     '<td class="heatRankingsRank">'+rankImage+'</td>'+
                     '<td class="heatRankingsGravatar"><img src="' + p.gravatar +
                         '" class="heatRankingsGravatar" ' + onclick + '/></td>'+
                     '<td class="heatRankingsNickname"><font ' + onclick + '>' +
                         p.nickname + '</font></td>'+
                     '<td class="heatRankingsFlag"><img src="' + flagUrl.replace(/^\/static/, "../static") +
                         '" class="heatRankingsFlag" /></td>'+
                     (!is_anytime ? '<td class="heatRankingsPreviousRank">'+previous_rank+'</td>' : '')+
                     '<td class="heatRankingsProfessional">' + prof + '</td>';
                for (j = 0; j < p.solved_problems; j++) {
                    s += '<td class="heatRankingSolved"></td>';
                }
                for (j = p.solved_problems; j < maxProblemNum; j++) {
                    s += '<td class="heatRankingUnsolved"><div></div></td>';
                }
                var finished = '';
                if (p.finished && p.finished != '') {
                    finished = p.finished;
                    if (/^(.*[0-9]+:[0-9]+:[0-9]+\.[0-9])[0-9]*$/.exec(finished) != null) {
                        finished = RegExp.$1;
                    }
                }
                s += '<td class="heatRankingsFinished">';
                if (finished) {
                    s += '<a href="javascript:loadHeatRanking(' + heatID +
                         ', \'' + p.finished + '\');return false;">' + finished + '<a>';
                } else {
                    s += finished;
                }
                s += '</td>';
                s += '</tr>';
                rank++;
            }
            s += '</tbody>';
            s += '</table>';
            $('#heatRankingsOut').html(s);
            //$('#levMBText').html(s);
            var stopTime = strToDatestamp(rankings['heatStopTime']);
            var currentTime = strToDatestamp(rankings['currentTime']);
            if (!currentTime || !stopTime || (currentTime - stopTime < 86400000)) {
                lastHeatID = heatID;
            }
        }
    });
}
function refreshHeatRanking() {
    if (lastHeatID > 0 && !getParameterFromURL('no_refresh')) {
        loadHeatRanking(lastHeatID);
    } else if (timer_id) {
        window.clearInterval(timer_id);
        timer_id = undefined;
    }
}

function renderTournamentRanking(result) {
    $('#levMBText').html(result['description']+' Results');
    var s = '';
    var n = 0;
    var lastHeatID = 0;
    for (var i in result['rounds']) {
        var r = result['rounds'][i];
        if (r && r['currentHeatID'] && (r['currentHeatID'] > 0)) {
            lastHeatID = r['currentHeatID'];
            var ss = ' onclick="displayTab(this, '+n+'); loadHeatRanking('+lastHeatID+');"';
            s += 
                '<td class="tabHeaderLeftOff"'+ss+'></td>'+
                '<td class="tabHeaderCenterOff"'+ss+'>'+r['description']+'</td>'+
                '<td class="tabHeaderRightOff"'+ss+'></td>';
        }
        n++;
    }
    if (n > 0) {
        s += 
            '<td class="tabHeaderRightEnd"></td>';
        $('#tournamentTabs').html(s);
        displayTab($('#tournamentTabs td')[0], n - 1);
        loadHeatRanking(lastHeatID);
        timer_id = window.setInterval(refreshHeatRanking, 30000);
    }
}

$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    //log_access('tournamentRanking');
    loadPlayerData();
    autoPreloadRollsImages();
    var tournamentID = getParameterFromURL('tournamentID');
    if (!tournamentID) {
        alert('No tournament selected');
        return;
    }
    $('a#tournamentContinueButton').attr('href', 'tournament.html?tournamentID='+tournamentID);
});
