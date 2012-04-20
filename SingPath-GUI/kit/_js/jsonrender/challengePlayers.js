function _showTab(td, index, tabs) {
    displayTab(td, index);
    for (var i = 0; i < tabs.length; i++) {
        if (i != index) {
            $(tabs[i]).hide();
        }
    }
    for (i = 0; i < tabs.length; i++) {
        if (i == index) {
            $(tabs[i]).show();
        }
    }
}
function showTab(index) {
    _showTab($('table.challengePlayersOut table.tabHeader td')[0], index,
        ['div.all_players', 'div.registered_players', 'div.unlocked_players',
        'div.submitted_players']);
}
function formatDate(str) {
    if (/([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].[0-9]+:[0-9]+)/.exec(str) != null) {
        return RegExp.$1;
    }
    return str;
}
function loadChallengePlayers() {
    var challenge_id = getIdFromURL('challenge_id');
    if (challenge_id) {
        ajax({
            url: '/jsonapi/list_challenge_players',
            data: {challenge_id: challenge_id},
            success: function(result) {
                var s = result['challenge']['name']
                $('#message').html('You are viewing the registered players for '+
                    'challenge: '+s)
                $('table.players').remove(); //there will be 4 table with this class!

                $('#all_players').append(generate_players_table(result, function(row){return true}));
                $('#registered_players').append(generate_players_table(result, function(row){
                    return row['playerRegistered'] && !row['playerUnlocked'] && !row['playerSubmitted']}));
                $('#unlocked_players').append(generate_players_table(result, function(row){
                    return row['playerRegistered'] && row['playerUnlocked'] && !row['playerSubmitted']}));
                $('#submitted_players').append(generate_players_table(result, function(row){
                    return row['playerRegistered'] && row['playerUnlocked'] && row['playerSubmitted']}));
            }
        });
    }
}
function generate_players_table(result, condition) {
    var html = '<table class="players">';
    if (result['players']) {
        for (var i in result['players']) {
            var ch = result['players'][i];
            if (condition(ch)) {
                html += '<tr>';
                var onclick = 'onclick="showProfilePopup(' + ch['player_id'] + ')"';
                if (ch['gravatar']) {
                    html += '<td class="gravatar"><img src="'+ch['gravatar']+'" '+onclick+'/></td>';
                } else {
                    html += '<td class="gravatar"></td>';
                }
                html += '<td class="player"><div '+onclick+' title="'+ch['nickname']+'">'+ch['nickname']+'</div></td>';
                if (ch['countryFlagURL']) {
                    html += '<td class="flag"><img src="'+ch['countryFlagURL']+'"/></td>';
                } else {
                    html += '<td class="flag"></td>';
                }
                if (ch['playerRegistered']) {
                    html += '<td class="register_date">'+formatDate(ch['playerRegisteredDate'])+'</td>';
                } else {
                    html += '<td class="register_date"></td>';
                }
                if (ch['playerUnlocked']) {
                    html += '<td class="unlock_date">'+formatDate(ch['playerUnlockedDate'])+'</td>';
                } else {
                    html += '<td class="unlock_date"></td>';
                }
                if (ch['playerSubmitted']) {
                    html += '<td class="submit_date">'+formatDate(ch['playerSubmittedDate'])+'</td>';
                    html += '<td class="message">'+ch['playerFeedback']+'</td>';
                    var s = '[No attachment]';
                    if (ch['attachmentID']) {
                        s = '<a href="/download_file?id='+ch['attachmentID']+'">download</a>';
                    }
                    html += '<td class="attachment">'+s+'</td>';
                } else {
                    html += '<td class="submit_date"></td>';
                    html += '<td class="message"></td>';
                    html += '<td class="attachment"></td>';
                }
                html += '<td class="submit_answer"></td>';
                html += '</tr>';
            }
        }
    }
    html += '</table>';
    return html;
}
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    log_access('challengePlayers');
    loadPlayerData();
    loadChallengePlayers();
});
