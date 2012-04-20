var badgesById = {}
var countriesById = {}
var current_player_id = 0;
var path_id = undefined;
var challenges_per_page = 30;
var page_all_challenges = 0;
var page_my_challenges = 0;

function getPathId() {
    if (path_id == undefined) {
        path_id = getIdFromURL('path_id', 0);
    }
    return path_id;
}

function getNamesFromMap(idlist, map) {
    var s = "";
    for (var i in idlist) {
        var id = idlist[i];
        if (s) {
            s += "<br>";
        }
        if (id && map[id]) {
            s += map[id];
        } else {
            s += id;
        }
    }
    return s;
}
function getMessage(msg) {
    if (msg && msg['error']) {
        return '['+msg['error']+']';
    }
    return ""+msg;
}
function loadChallenges() {
    _loadChallenges(true);
}
function loadMyChallenges() {
    _loadChallenges(false);
}
function _loadChallenges(is_all_challenges) {
    var data = {};
    if (getPathId()) {
        data['path_id' ] = getPathId();
    }
    data['limit'] = challenges_per_page + 1;
    var page = (is_all_challenges ? page_all_challenges : page_my_challenges);
    data['offset'] = challenges_per_page * page;
    var url = (is_all_challenges ? 'list_challenges' : 'list_my_challenges');
    var prevCode;
    var nextCode;
    if (is_all_challenges) {
        prevCode = 'page_all_challenges--;loadChallenges()';
        nextCode = 'page_all_challenges++;loadChallenges()';
    } else {
        prevCode = 'page_my_challenges--;loadMyChallenges()';
        nextCode = 'page_my_challenges++;loadMyChallenges()';
    }
    ajax({
        url: '../jsonapi/'+url,
        data: data,
        success: function(result){
            renderChallenges(
                result,
                is_all_challenges,
                challenges_per_page,
                data['offset'],
                prevCode,
                nextCode);
        }
    });
}
function renderChallenges(result, is_all_challenges, limit, offset,
        prevCode, nextCode) {
    var html = '<table class="challenge all_challenge" id="challenge">';
    if (result['challenges']) {
        for (var j in result['challenges']) {
            if (j >= limit) {
                break;
            }
            var ch = result['challenges'][j];

            var badges = [];
            //The "Needed Badge" shown on the Challenge Board should always be the badge
            //needed to unlock the challenge. Please don't switch between needed to view
            //and needed to unlock at this point. We will need to think through the user
            //experience a lot more before we do that.
            //if (!ch['_playerRegistered']) {
            //    badges = ch['registeredRequiredBadges'];
            //} else {
            //    badges = ch['unlockRequiredBadges'];
            //}
            badges = ch['unlockRequiredBadges'];

            var i;
            for (i in badges) {
                badges[i] = badgesById[badges[i]]
            }
            badges.sort(function(a, b){
                if (a && b && a['awardOrder'] && b['awardOrder']) {
                    if (a['awardOrder'] < b['awardOrder']) {
                        return 1;
                    }
                    if (a['awardOrder'] > b['awardOrder']) {
                        return -1;
                    }
                }
                return 0;
            });
            var cnt = 0;
            var s = '';
            for (i in badges) {
                var b = badges[i];
                if (b) {
                    s += createBadge(b.imageURL, b.description);
                    cnt++;
                    if (cnt >= 2) {
                        break;
                    }
                }
            }
            badges = s;

            var location = ch['allowedCountries'];
            if (location.length > 0 && countriesById[location[0]]) {
                location = '<img src="'+countriesById[location[0]].flagUrl+'"/>';
            } else {
                location = '';
            }
            var status = '';
            var tooltip = '';
            if (ch['_playerRegistered']) {
                status = 'Registered';
                tooltip = 'You are registered for this challenge';
            }
            if (ch['_playerRegistered'] && ch['_unlockBadgesEarned']) {
                status = 'Unlocked';
                tooltip = 'You are already unlocked this challenge';
            }
            if (ch['_playerRegistered'] && ch['_playerSubmitted']) {
                status = 'Submitted';
                tooltip = 'You are unlocked this challenge and already sent a message to the challenge owner';
            }
            if (status) {
                status = '<font title="'+tooltip+'">'+status+'</font>';
            }
            if (is_all_challenges) {
                html +=
                    '<tr>'+
                      '<td class="name"><a href="/challenge/'+ch['challenge_id']+'">'+ch['description']+'</a></td>'+
                      '<td class="location">'+location+'</td>'+
                      '<td class="needed">'+badges+'</td>'+
                      '<td class="startdate">'+ch['startDate']+'</td>'+
                      '<td class="enddate">'+ch['endDate']+'</td>'+
                      '<td class="locked">'+status+'</td>'+
                    '</tr>';
            } else {
                if (parseInt(current_player_id) == parseInt(ch['owner_player_id'])) {
                    html +=
                        '<tr>'+
                          '<td class="name"><a href="/challenge/'+ch['challenge_id']+'">'+
                            ch['description']+'</a></td>'+
                          '<td class="location">'+''+'</td>'+
                          '<td class="needed">'+badges+'</td>'+
                          '<td class="startdate">'+ch['startDate']+'</td>'+
                          '<td class="enddate">'+ch['endDate']+'</td>'+
                          '<td class="locked"><table><tr><td>'+
                          '<a href="challengeCreate.html?challenge_id='+
                            ch['challenge_id']+'"><img class="rolls editchallenge" '+
                            'src="_images/commonButtons/editCircle_off.png" '+
                            'title="Edit this challenge"></a>'+
                          '</td><td>'+
                          '<a href="challengePlayers.html?challenge_id='+
                            ch['challenge_id']+'"><img class="rolls editchallenge" '+
                            'src="_images/commonButtons/statistics_off.png" '+
                            'title="View registered players for this challenge"></a>'+
                          '</td></tr></table>'+
                          '</td>'+
                        '</tr>';
                }
            }
        }
    }
    html += '</table>';
    //add pager if it is necessary
    var result_num = result['challenges'] ? result['challenges'].length : 0;
    var prev_disabled = (offset == 0);
    var next_disabled = (result_num <= limit);
    if (!prev_disabled || !next_disabled) {
        if (prev_disabled) {
            prev_disabled = 'disabled';
            prevCode = '';
        } else {
            prev_disabled = '';
        }
        if (next_disabled) {
            next_disabled = 'disabled';
            nextCode = '';
        } else {
            next_disabled = '';
        }
        html += '<table class="pager"><tr>';
        html += '<td>';
        html += '<span class="emptyButton '+prev_disabled+'" onclick="'+prevCode+'">Prev '+limit+'</span>';
        html += '</td>';
        html += '<td>&nbsp;';
        if (result_num > 0) {
            html += (offset + 1)+' &ndash; '+(offset + Math.min(limit, result_num));
        } else {
            html += 'No Result';
        }
        html += '&nbsp;</td>';
        html += '<td>';
        html += '<span class="emptyButton '+next_disabled+'" onclick="'+nextCode+'">Next '+limit+'</span>';
        html += '</td>';
        html += '</tr></table>';
    }
    if (is_all_challenges) {
        $('#all_challenges').html(html);
    } else {
        $('#my_challenges').html(html);
    }
    initRolls();
}
function loadCountries() {
    ajax({
        url: '../jsonapi/all_countries',
        success: function(result) {
            for (var i in result['countries']) {
                var b = result['countries'][i];
                var name = b['countryName'];
                countriesById[b['id']] = b;
            }

            //after we have elements in the selects, we can download challenges lists
            loadChallenges();
            loadMyChallenges();
        }
    });
}
function loadBadges() {
    ajax({
        url: '/jsonapi/all_badges',
        success: function(result) {
            for (var i in result['badges']) {
                var b = result['badges'][i];
                badgesById[b['id']] = b;
            }

            loadCountries();
        }
    });
}
function addChallengeAction(challenge_id, action) {
    if (challenge_id && action) {
        if (action == 'register') {
            ajax({
                url: '/jsonapi/register_challenge',
                data: {challenge_id: challenge_id},
                success: function(result) {
                    loadChallenges();
                }
            });
        } else if (action == 'unregister') {
            ajax({
                url: '/jsonapi/unregister_challenge',
                data: {challenge_id: challenge_id},
                success: function(result) {
                    loadChallenges();
                }
            });
        }
    }
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
    loadChallenges();
}
function loadLanguageSelector() {
    ajax({
        url: '../jsonapi/get_current_paths',
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
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    log_access('challengeBoard');
    loadPlayerData(function(result) {
        current_player_id = result['player_id'];
    });
    loadBadges();
    getPathId();
    loadLanguageSelector();
});
function _showTab(td, index, firstTab, secondTab, thirdTab) {
    displayTab(td, index);
    if (index == 0) {
        $(secondTab).hide();
        if (thirdTab) {
            $(thirdTab).hide();
        }
        $(firstTab).show();
    } else if (index == 1) {
        $(firstTab).hide();
        if (thirdTab) {
            $(thirdTab).hide();
        }
        $(secondTab).show();
    } else if (index == 2) {
        $(firstTab).hide();
        $(secondTab).hide();
        $(thirdTab).show();
    }
}
function showTab(index) {
    _showTab($('table.challengeBoardOut table.tabHeader td')[0], index, 'div.all_challenges', 'div.my_challenges');
}
