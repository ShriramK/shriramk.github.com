var badgesById = {}
var countriesById = {}

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
function loadChallenges(result,badgesById,countriesById) {
            $('table#challenge').remove();
            var html =
                '<table class="challenge_list" id="challenge" border="1">'+
                '  <tr>'+
                '    <td>Edit</td>'+ //edit
                '    <td>Register</td>'+ //register
                '    <td>Submit Message</td>'+ //submit
                '    <td>Owner Response</td>'+ //owner response
                '    <td>View Registered Players</td>'+ //view registered players
                '    <td>Name</td>'+
                '    <td>Description</td>'+
                '    <td>Created</td>'+
                '    <td>StartDate</td>'+
                '    <td>EndDate</td>'+
                '    <td>Owner</td>'+
                '    <td>Public Message</td>'+
                '    <td>Public Required Badges</td>'+
                '    <td>Registered Message</td>'+
                '    <td>Registered Required Badges</td>'+
                '    <td>Unlock Message</td>'+
                '    <td>Unlock Required Badges</td>'+
                '    <td>Private Message</td>'+
                '    <td>MaxUnlocks</td>'+
                '    <td>IsJobListing</td>'+
                '    <td>Allowed Countries</td>'+
                '  </tr>';
            if (result['challenges']) {
                for (var i in result['challenges']) {
                    var ch = result['challenges'][i];
                    html +=
                        '<tr>'+
                          '<td>'+(ch['_can_edit'] ? '<a href="editChallenge.html?challenge_id='+ch['challenge_id']+'">EDIT</a>' : '')+'</td>';
                    if (ch['_registeredBadgesEarned']) {
                        if (ch['_playerRegistered']) {
                            html += '<td><a href="javascript:" onclick="addChallengeAction('+ch['challenge_id']+', \'unregister\');">Unregister</a></td>';
                        } else {
                            html += '<td><a href="javascript:" onclick="addChallengeAction('+ch['challenge_id']+', \'register\');">Register</a></td>';
                        }
                    } else {
                        html += '<td></td>';
                    }
                    if (ch['_playerRegistered'] && ch['_unlockBadgesEarned'] && !ch['_playerSubmitted']) {
                        html += '<td><a href="challengeSubmit.html?challenge_id='+ch['challenge_id']+'">Submit message</a></td>';
                    } else {
                        html += '<td>'+(ch['playerFeedback'] ? ch['playerFeedback'] : '')+'</td>';
                    }
                    if (ch['ownerResponse']) {
                        html += '<td>'+ch['ownerResponse']+'</td>';
                    } else {
                        html += '<td></td>';
                    }
                    if (ch['_can_edit']) {
                        html += '<td><a href="listChallengePlayers.html?challenge_id='+ch['challenge_id']+'">View registered players</a></td>';
                    } else {
                        html += '<td></td>';
                    }
                    html +=
                          '<td>'+ch['name']+'</td>'+
                          '<td>'+ch['description']+'</td>'+
                          '<td>'+ch['created']+'</td>'+
                          '<td>'+ch['startDate']+'</td>'+
                          '<td>'+ch['endDate']+'</td>'+
                          '<td>'+(ch['owner'] && ch['owner']['nickname'] ? ch['owner']['nickname'] : '')+'</td>'+
                          '<td>'+getMessage(ch['publicMessage'])+'</td>'+
                          '<td>'+getNamesFromMap(ch['publicRequiredBadges'], badgesById)+'</td>'+
                          '<td>'+getMessage(ch['registeredMessage'])+'</td>'+
                          '<td>'+getNamesFromMap(ch['registeredRequiredBadges'], badgesById)+'</td>'+
                          '<td>'+getMessage(ch['unlockMessage'])+'</td>'+
                          '<td>'+getNamesFromMap(ch['unlockRequiredBadges'], badgesById)+'</td>'+
                          '<td>'+getMessage(ch['privateMessage'])+'</td>'+
                          '<td>'+(ch['maxUnlocks'] ? ch['maxUnlocks'] : '')+'</td>'+
                          '<td>'+(ch['isJobListing'] != 0 ? 'true' : 'false')+'</td>'+
                          '<td>'+getNamesFromMap(ch['allowedCountries'], countriesById)+'</td>'+
                        '</tr>';
                }
            }
            html += '</table>';

            $('#beardy').append(html);
}
function loadCountries() {
    ajax({
        url: '/jsonapi/all_countries',
        success: function(result) {
            for (var i in result['countries']) {
                var b = result['countries'][i];
                var name = b['countryName'];
                countriesById[b['id']] = name;
            }

            //after we have elements in the selects, we can download challenges list
            loadChallenges();
        }
    });
}
function loadBadges() {
    ajax({
        url: '/jsonapi/all_badges',
        success: function(result) {
            for (var i in result['badges']) {
                var b = result['badges'][i];
                var name = b['description'];
                badgesById[b['id']] = name;
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
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    //loadBadges();
});
