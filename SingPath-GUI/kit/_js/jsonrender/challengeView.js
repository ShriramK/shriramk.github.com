var fileUpload;
var challenge;
var allBadges = {};
function getChallengeId() {
    var challenge_id = getIdFromURL('challenge_id');
    if (!challenge_id) {
        if (/\/([0-9]+$)/.exec(document.URL) != null) {
            challenge_id = parseInt(RegExp.$1);
        }
    }
    return challenge_id;
}
function getBadgeImages(badgeIds) {
    var s = '';
    for (var i in badgeIds) {
        var badgeId = badgeIds[i];
        var badge = allBadges[badgeId];
        if (badge) {
            s += createBadge(badge.imageURL, badge.description);
        }
    }
    if (s == '') {
        s = 'No required badges.';
    }
    return s;
}
function loadChallenge() {
    var challenge_id = getChallengeId();
    if (challenge_id) {
        ajax({
            url: '/jsonapi/get_challenge',
            data: {challenge_id: challenge_id},
            success: function(result) {
                challenge = result['challenge'];
/*                $('#name').val(challenge['name']);
                $('#description').val(challenge['description']);
                $('#startDate').val(challenge['startDate']);
                $('#endDate').val(challenge['endDate']);
                $('#publicMessage').val(challenge['publicMessage']);
                setSelected($('#publicRequiredBadges')[0], challenge['publicRequiredBadges']);
                $('#registeredMessage').val(challenge['registeredMessage']);
                setSelected($('#registeredRequiredBadges')[0], challenge['registeredRequiredBadges']);
                $('#unlockMessage').val(challenge['unlockMessage']);
                setSelected($('#unlockRequiredBadges')[0], challenge['unlockRequiredBadges']);
                $('#privateMessage').val(challenge['privateMessage']);
                $('#maxUnlocks').val(challenge['maxUnlocks'] ? challenge['maxUnlocks'] : '');
                $('#isJobListing')[0].checked = (challenge['isJobListing'] == '1');
                setSelected($('#allowedCountries')[0], challenge['allowedCountries']);
*/
                //challenge details
                var html = '';
                html += '<font class="label">Name:</font>';
                html += '<font class="value">'+challenge['name']+'</font>';
                html += '<br/>';
                html += '<font class="label">Description:</font>';
                html += '<font class="value">'+challenge['description']+'</font>';
                html += '<br/>';
                html += '<font class="label">Public Message:</font>';
                html += '<font class="value">'+challenge['publicMessage']+'</font>';
                html += '<br/>';
                html += '<font class="label">Required Badges To Register For This Challenge:</font>';
                html += '<font class="value">'+getBadgeImages(challenge['registeredRequiredBadges'])+'</font>';
                html += '<br/>';
                html += '<font class="label">Required Badges To Unlock This Challenge:</font>';
                html += '<font class="value">'+getBadgeImages(challenge['unlockRequiredBadges'])+'</font>';
                html += '<br/>';

                $('#challengeDetails').html(html);
                var registered = challenge['_playerRegistered'];
                var unlocked = challenge['_playerUnlocked'] || challenge['_unlockBadgesEarned'];
                var submitted = challenge['_playerSubmitted'];
                var submit = false;
                //challenge actions
                html = '';
                if (registered) {
                     if (submitted) {
                        html = '<font class="register">You successfully unlocked '+
                            'this challenge and sent a message to the challenge creator. '+
                            'You can review the private message below.</font>';
                     } else if (unlocked) {
                         submit = true;
                         
                        html = '<font class="send">You unlocked this challenge, so you can send a private message to the challenge owner:</font>';
                        html += '<form action="/jsonapi/challenge_submit" enctype="multipart/form-data" method="post">';
                        html += '<table class="sendmessage">';
                        html += '  <tr>';
                        html += '    <td class="message">';
                        html += '      <table class="send">';
                        html += '      <tr>';
                        html += '        <td class="sendLabel">Message:</td>';
                        html += '        <td class="send">';
                        html += '          <div>';
                        html += '            <input type="text" class="send" id="player_message" name="player_message"/>';
                        html += '          </div>';
                        html += '        </td>';
                        html += '      </tr>';
                        html += '      </table>';
                        html += '    </td>';
                        html += '  </tr>';
                        html += '  <tr>';
                        html += '    <td class="file">';
                        html += '      <table class="file">';
                        html += '        <tr>';
                        html += '          <td>';
                        html += '            <font class="file">File:&nbsp;</font>';
                        html += '          </td>';
                        html += '          <td>';
                        html += '            <span class="emptySmallButton" id="button2">Select...</span>';
                        html += '          </td>';
                        html += '          <td>&nbsp;';
                        html += '            <font id="selectedfile"></font>';
                        html += '          </td>';
                        html += '        </tr>';
                        html += '      </table>';
                        html += '    </td>';
                        html += '  </tr>';
                        html += '  <tr>';
                        html += '    <td class="button">';
                        html += '      <span class="emptySmallButton" onclick="sendMessage()">Send message</span>';
                        html += '    </td>';
                        html += '  </tr>';
                        html += '</table>';
                        html += '</form>';
                    } else {
                        html = '<font class="register">You are already registered for this challenge.</font>';
                        //html += '<img class="rolls" onclick="unregisterMe('+challenge['challenge_id']+');" src="/alex/_images/commonButtons/registerNo_off.png"/>';
                    }
                } else {
                    html = '';
                    html += '<font class="register">Would you like to register for this challenge?</font>';
                    if (player_result['error']) {
                        html += '<font class="register">You have to sign in first to register!</font>';
                        html += '<a href="javascript:" onclick="showJanrainLoginBox();return false"><img src="/alex/_images/landingPage/landingPageButtons/signIn_off.png" alt="Sign in to SingPath" name="signIn" width="166" height="39" border="0" id="signIn" /></a>';
                    } else {
                        html += '<img class="rolls" onclick="registerMe('+challenge['challenge_id']+');" src="/alex/_images/commonButtons/registerYes_off.png"/>';
                    }
                }
                $('#challengeActions').html(html);

                if (submit) {
                    fileUpload = new AjaxUpload('button2', {
                        action: '/jsonapi/challenge_submit',
                        name: 'attachment',
                        responseType: 'json',
                        autoSubmit: false,
                        onSubmit : function(file , ext){
                            /* Setting data */
                            this.setData({
                                'player_message': $('#player_message').val(),
                                'challenge_id': challenge['challenge_id']
                            });
                        },
                        onChange : function(file, ext){
                            $('#selectedfile').html(file);
                        },
                        onComplete : function(file, response){
                            $('#selectedfile').html('');
                            if (response.error) {
                                alert(response.error);
                            } else {
                                alert('You have successfully sent the message to the challenge owner');
                            }
                            loadChallenge();
                        }
                    });
                }

                //links
                var p = document.URL.indexOf('/', 7);
                var host;
                if (!p || p < 0) {
                    host = 'http://'+window.location.hostname;
                } else {
                    host = document.URL.substr(0, p);
                }
                var link = host + '/challenge/'+challenge['challenge_id'];
                $('#link').val(link);

                //locked / unlocked
                if (registered && unlocked) {
                    $('#unlocked').show();
                    $('#locked').hide();
                    html = '<font class="value">Well done for unlocking the challenge!</font>';
                    html += '<font class="value">'+challenge['unlockMessage']+'</font>';
                    $('#privateMessage').html(html);
                } else {
                    $('#locked').show();
                    $('#unlocked').hide();
                }

                autoPreloadRollsImages();
                initRolls();
            }
        });
    }
}
function loadCountries() {
    ajax({
        url: '../jsonapi/all_countries',
        skip_check_login_error: true,
        skip_display_error: true,
        success: function(result) {
            var s = '';
            for (var i in result['countries']) {
                var b = result['countries'][i];
                var name = b['countryName'];
                s += '<option value="'+escape(b['id'])+'">'+(name.replace(/</g, '&lt;'))+'</option>';
            }
            $('#allowedCountries').html(s);

            //after we have elements in the selects, we can download challenge data
            loadChallenge();
        }
    });
}
function loadBadges() {
    ajax({
        url: '../jsonapi/all_badges',
        skip_check_login_error: true,
        skip_display_error: true,
        success: function(result) {
            allBadges = {};
            for (var i in result['badges']) {
                var b = result['badges'][i];
                allBadges[b['id']] = b;
            }

            loadCountries();
        }
    });
}
function registerMe(challenge_id) {
    if (player_result['error']) {
        showJanrainLoginBox();
    } else {
        ajax({
            url: '/jsonapi/register_challenge',
            data: {challenge_id: challenge_id},
            success: function(result) {
                loadChallenge();
            }
        });
    }
}
function unregisterMe(challenge_id) {
    ajax({
        url: '/jsonapi/unregister_challenge',
        data: {challenge_id: challenge_id},
        success: function(result) {
            loadChallenge();
        }
    });
}
function sendMessage() {
    if (! $('#player_message').val()) {
        alert('The message must not be empty');
    } else if (fileUpload) {
        //send message without file
        if (!fileUpload._input || fileUpload._input.value == '') {
            ajax({
                url: '/jsonapi/challenge_submit',
                data: {
                    challenge_id: challenge['challenge_id'],
                    player_message: $('#player_message').val()
                },
                success: function(result) {
                    $('#selectedfile').html('');
                    alert('You have successfully sent the message to the challenge owner');

                    loadChallenge();
                }
            });
        } else {
            //send message and file
            fileUpload.submit();
        }
    }
}

var player_result;
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    //log_access('challengeView');
    loadPlayerData(function(player){player_result = player}, true);
    loadBadges();
    showAdv();
});
