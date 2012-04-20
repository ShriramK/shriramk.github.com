function getChallengeId() {
    var challenge_id = getIdFromURL('challenge_id');
    if (!challenge_id) {
    	if (/\/([0-9]+$)/.exec(document.URL) != null) {
    		challenge_id = parseInt(RegExp.$1);
    	}
    }
	return challenge_id;
}
function loadChallenge() {
    var challenge_id = getChallengeId();
    if (challenge_id) {
        ajax({
            url: '/jsonapi/get_challenge_for_edit',
            data: {challenge_id: challenge_id},
            success: function(result) {
                var challenge = result['challenge'];
                $('#name').val(challenge['name']);
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
            }
        });
    }
}
function loadCountries() {
    ajax({
        url: '/jsonapi/all_countries',
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
        success: function(result) {
            var s = '';
            for (var i in result['badges']) {
                var b = result['badges'][i];
                var found = false;
                for (var j in b['class']) {
                    if (b['class'][j] == 'Level_Badge') {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    var name = b['description'];
                    s += '<option value="'+escape(b['id'])+'">'+(name.replace(/</g, '&lt;'))+'</option>';
                }
            }
            $('#publicRequiredBadges').html(s);
            $('#registeredRequiredBadges').html(s);
            $('#unlockRequiredBadges').html(s);

            loadCountries();
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
    loadBadges();
});
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
function saveChallenge() {
    var name = $('#name')[0].value;
    var description = $('#description')[0].value;
    var startDate = $('#startDate')[0].value;
    var endDate = $('#endDate')[0].value;
    var publicMessage = $('#publicMessage')[0].value;
    var publicRequiredBadges = getSelected($('#publicRequiredBadges')[0]);
    var registeredMessage = $('#registeredMessage')[0].value;
    var registeredRequiredBadges = getSelected($('#registeredRequiredBadges')[0]);
    var unlockMessage = $('#unlockMessage')[0].value;
    var unlockRequiredBadges = getSelected($('#unlockRequiredBadges')[0]);
    var privateMessage = $('#privateMessage')[0].value;
    var maxUnlocks = $('#maxUnlocks')[0].value;
    var isJobListing = ($('#isJobListing')[0].checked ? '1' : '0');
    var allowedCountries = getSelected($('#allowedCountries')[0]);
  
    var challenge_id = getChallengeId();
    var data = {
            name: name,
            description: description,
            startDate: startDate,
            endDate: endDate,
            publicMessage: publicMessage,
            publicRequiredBadges: publicRequiredBadges,
            registeredMessage: registeredMessage,
            registeredRequiredBadges: registeredRequiredBadges,
            unlockMessage: unlockMessage,
            unlockRequiredBadges: unlockRequiredBadges,
            privateMessage: privateMessage,
            maxUnlocks: maxUnlocks,
            isJobListing: isJobListing,
            allowedCountries: allowedCountries
    };
    if (challenge_id) {
        data['challenge_id'] = challenge_id;
    }
    ajax({
        url: '/jsonapi/save_challenge',
        data: data,
        success: function(result) {
            if (result['challenge_id'] && parseInt(result['challenge_id'])) {
                window.location = '/alex/editChallenge.html?challenge_id='+result['challenge_id'];
            }
        }
    });
}
