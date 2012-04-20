function loadChallengePlayers() {
    var challenge_id = getIdFromURL('challenge_id');
    if (challenge_id) {
        ajax({
            url: '/jsonapi/list_challenge_players',
            data: {challenge_id: challenge_id},
            success: function(result) {
                $('table#challenge').remove();
                var html =
                    '<table class="challenge_players_list" id="challenge" border="1">'+
                    '  <tr>'+
                    '    <td>Player nickname</td>'+
                    '    <td>Player email</td>'+
                    '    <td>Registered</td>'+
                    '    <td>Unlocked</td>'+
                    '    <td>Submit date</td>'+
                    '    <td>Submitted message</td>'+
                    '    <td>Attachment</td>'+
                    '    <td>Answer date</td>'+
                    '    <td>Answer message</td>'+
                    '  </tr>';
                if (result['players']) {
                    for (var i in result['players']) {
                        var ch = result['players'][i];
                        html +=
                            '<tr>'+
                              '<td>'+ch['nickname']+'</td>'+
                              '<td>'+ch['email']+'</td>';
                        if (ch['playerRegistered']) {
                            html += '<td>'+ch['playerRegisteredDate']+'</td>';
                        } else {
                            html += '<td></td>';
                        }
                        if (ch['playerUnlocked']) {
                            html += '<td>'+ch['playerUnlockedDate']+'</td>';
                        } else {
                            html += '<td></td>';
                        }
                        if (ch['playerSubmitted']) {
                            html += '<td>'+ch['playerSubmittedDate']+'</td>';
                            html += '<td>'+ch['playerFeedback']+'</td>';
                            var s = '[No attachment]';
                            if (ch['attachmentID']) {
                                s = '<a href="/download_file?id='+ch['attachmentID']+'">download</a>';
                            }
                            html += '<td>'+s+'</td>';
                        } else {
                            html += '<td></td>';
                            html += '<td></td>';
                            html += '<td></td>';
                        }
                        if (ch['ownerResponded']) {
                            html += '<td>'+ch['ownerResponseDate']+'</td>';
                            html += '<td>'+ch['ownerResponse']+'</td>';
                        } else {
                            html += '<td></td>';
                            if (ch['playerSubmitted']) {
                                var player_id = ch['player_id'];
                                html += '<td><a href="challengeAnswer.html?challenge_id='+challenge_id+'&player_id='+player_id+'">Send answer</a></td>';
                            } else {
                                html += '<td></td>';
                            }
                        }
                        html += '</tr>';
                    }
                }
                html += '</table>';

                $('#beardy').append(html);
            }
        });
    }
}
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    loadChallengePlayers();
});
