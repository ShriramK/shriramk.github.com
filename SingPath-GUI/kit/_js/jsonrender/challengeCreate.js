var fileUpload;
var challenge;
var paths = {};
var badges = {};
function setSelected(select, selectedElementValues) {
    for(var i = 0; i < select.options.length; i++) {
        var v = select.options[i].value;
        for (var j in selectedElementValues) {
            if (selectedElementValues[j] == v) {
                select.options[i].selected = 'selected';
            }
        }
    }
}
function getSelected(select) {
    var res = "";
    for(var i = 0; i < select.options.length; i++) {
        if (select.options[i].selected) {
            if (res) {
                res += ',';
            }
            res += ""+select.options[i].value;
        }
    }
    return res;
}
function getChallengeId() {
    var challenge_id = getIdFromURL('challenge_id');
    if (!challenge_id) {
        if (/\/([0-9]+$)/.exec(document.URL) != null) {
            challenge_id = parseInt(RegExp.$1);
        }
    }
    return challenge_id;
}
function getDateStr(s) {
    if (s && s != 'None') {
        return ''+s;
    }
    return '';
}
function loadChallenge(result) {
                challenge = result['challenge'];
                $('#name').val(challenge['name']);
                $('#description').val(challenge['description']);
                $('#start_date').val(getDateStr(challenge['startDate']));
                $('#end_date').val(getDateStr(challenge['endDate']));
                $('#public_message').val(challenge['publicMessage']);
                fillBadges($('#registration_levels td:first-child select'), challenge['registeredRequiredBadges']);
                $('#private_message').val(challenge['unlockMessage']);
                fillBadges($('#unlock_levels td:first-child select'), challenge['unlockRequiredBadges']);
                setSelected($('#country')[0], challenge['allowedCountries']);

                autoPreloadRollsImages();
                initRolls();
}
function fillBadges($select_elements, badge_ids) {
    var i = 0;
    $select_elements.each(function(elem){
        var badge_id = badge_ids[i];
        var badge = badges[badge_id];
        if (badge_id && badge) {
            elem = this;
            for(var j = 0; j < elem.options.length; j++) {
                var option = elem.options[j];
                if (parseInt(option.value) == parseInt(badge['path_id'])) {
                    elem.options.selectedIndex = j;

                    showLevels(elem);
                    var n = elem.parentNode;
                    n = getNextSiblingWithName(n, 'TD');
                    n = getFirstChildNodeWithName(n, 'SELECT');

                    for (var t = 0; t < n.options.length; t++) {
                        var opt = n.options[t];
                        if (parseInt(opt.value) == parseInt(badge['id'])) {
                            n.options.selectedIndex = t;
                            showBadge(badge['path_id'], n);
                            break;
                        }
                    }
                    break;
                }
            }
        }
        i++;
    });
}
function loadCountries(result) {
            var s = '<option value="">[Worldwide]</option>';
            for (var i in result['countries']) {
                var b = result['countries'][i];
                var name = b['countryName'];
                s += '<option value="'+escape(b['id'])+'">'+(name.replace(/</g, '&lt;'))+'</option>';
            }
            $('#country').html(s);

            //after we have elements in the selects, we can download challenge data
}
function loadGamePathsAndBadges(result) {
            paths = result['paths'];
            var path_options = '<option value="-1">--</option>';
            for (var i in paths) {
                var path = paths[i];
                var badge_options = '<option value="-1">--</option>';
                for (var j in path['badges']) {
                    var badge = path['badges'][j];
                    badge_options += '<option value="'+escape(badge['id'])+'">'+
                        (badge['name'].replace(/</g, '&lt;'))+'</option>';
                    badge['path_id'] = path['id'];
                    badges[badge['id']] = badge;
                }
                path['badge_options'] = badge_options;
                
                path_options += '<option value="'+escape(path['id'])+'">'+
                    (path['name'].replace(/</g, '&lt;'))+'</option>';
            }
            var s = '<table class="level_chooser_content">';
            for (i = 0; i < 6; i++) {
                s += '<tr class="level">'+
                         '<td class="language inputShort">'+
                             '<select onchange="showLevels(this)">'+
                                 path_options+
                             '</select>'+
                         '</td>'+
                         '<td class="level inputShort">'+
                             '<select>'+
                             '</select>'+
                         '</td>'+
                         '<td class="badge">'+
                         '</td>'+
                     '</tr>';
            }
            s += '</table>';
            $('table.level_chooser div.content').html(s); //there are 2 divs!
}
function showLevels(elem) {
    var path_id = (elem.selectedIndex >= 0 ? parseInt(elem.options[elem.selectedIndex].value) : -1);
    var path = false;
    for (var i in paths) {
        var p = paths[i];
        if (p['id'] == path_id) {
            path = p;
            break;
        }
    }
    var s = '<select onchange="showBadge('+path_id+', this)">'+
                (path ? path['badge_options'] : '')+
            '</select>';
    var n = elem.parentNode;
    n = getNextSiblingWithName(n, 'TD');
    n.innerHTML = s;

    var nn = getFirstChildNodeWithName(n, 'SELECT');
    showBadge(path_id, nn);
}
function showBadge(path_id, elem) {
    var badge_id = (elem.selectedIndex >= 0 ? parseInt(elem.options[elem.selectedIndex].value) : -1);
    var badge = badges[badge_id];
    var s = '';
    if (badge) {
        s = '<img src="'+badge['url']+'"/>';
    }
    var n = elem.parentNode;
    n = getNextSiblingWithName(n, 'TD');
    n.innerHTML = s;
}
function createChallenge() {
    var registration_badges = [];
    $('#registration_levels td:first-child + td select').each(function(elem){
        elem = this;
        var badge_id = (elem.selectedIndex >= 0 ? parseInt(elem.options[elem.selectedIndex].value) : -1);
        if (badge_id >= 0) {
            registration_badges.push(badge_id);
        }
    });
    var unlock_badges = [];
    $('#unlock_levels td:first-child + td select').each(function(elem){
        elem = this;
        var badge_id = (elem.selectedIndex >= 0 ? parseInt(elem.options[elem.selectedIndex].value) : -1);
        if (badge_id >= 0) {
            unlock_badges.push(badge_id);
        }
    });
    
    var name = $('#name')[0].value;
    var description = $('#description')[0].value;
    var startDate = $('#start_date')[0].value;
    var endDate = $('#end_date')[0].value;
    var publicMessage = $('#public_message')[0].value;
    var publicRequiredBadges = [];
    var registeredMessage = '';
    var registeredRequiredBadges = registration_badges;
    var unlockMessage = $('#private_message')[0].value;
    var unlockRequiredBadges = unlock_badges;
    var privateMessage = '';
    var maxUnlocks = '';
    var isJobListing = '0';
    var allowedCountries = getSelected($('#country')[0]);

    if (name == '') {
        alert('The challenge name cannot be empty');
        return;
    }
    if (description == '') {
        alert('The challenge description cannot be empty');
        return;
    }
    if (publicMessage == '') {
        alert('The public message cannot be empty');
        return;
    }
    if (!startDate) {
        alert('The start date cannot be empty');
        return;
    }
    if (!endDate) {
        alert('The end date cannot be empty');
        return;
    }
    if (unlockRequiredBadges.length == 0) {
        alert('Please select at least one badge in the "Unlock Levels" box');
        return;
    }
    var challenge_id = getChallengeId();
    var data = {
            name: name,
            description: description,
            startDate: startDate,
            endDate: endDate,
            publicMessage: publicMessage,
            publicRequiredBadges: ''+publicRequiredBadges,
            registeredMessage: registeredMessage,
            registeredRequiredBadges: ''+registeredRequiredBadges,
            unlockMessage: unlockMessage,
            unlockRequiredBadges: ''+unlockRequiredBadges,
            privateMessage: privateMessage,
            maxUnlocks: maxUnlocks,
            isJobListing: isJobListing,
            allowedCountries: allowedCountries
    };
    if (challenge_id) {
        data['challenge_id'] = challenge_id;
    }
    ajax({
        url: '/jsonapi/save_challenge?callback=?',
        data: data,
        type: 'GET',
        dataType: 'json', //dataType is json when using POST method!
        success: function(result) {
            if (result['challenge_id'] && parseInt(result['challenge_id'])) {
                window.location = '/alex/challengeBoard.html';
            }
        }
    });
}

var player_result;
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    var now = new Date();
    //start date defaults to the previous day because of the timezone issue
    var date = new Date(now.getTime() - 86400 * 1000);
    var start_dp = $('input#start_date').datePicker({createButton: false, startDate: date.asString()}).val(date.asString()).trigger('change');
    $('a#start_date_picker').bind('click', function() {
        start_dp.dpDisplay(this);
        this.blur();
        return false;
    });
    date = new Date(now.getTime() + 86400 * 30 * 1000); //end date defaults to 30 days later
    var end_dp = $('input#end_date').datePicker({createButton: false}).val(date.asString()).trigger('change');
    $('a#end_date_picker').bind('click', function() {
        end_dp.dpDisplay(this);
        this.blur();
        return false;
    });
    //log_access('challengeCreate');
    loadPlayerData(function(player){player_result = player});
    //loadGamePathsAndBadges();
});
