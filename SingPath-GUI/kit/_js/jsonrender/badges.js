allBadges = {};
function str(s) {
    return "" + s;
}
function loadBadges() {
    ajax({
        url: '../jsonapi/all_badges',
        data: {with_awards: 1},
        success: function(result) {
            allBadges = {};
            var levelBadges = '';
            var countryBadges = '';
            var otherBadges = '';
            var prevBadge = undefined;
            for (var i in result['badges']) {
                var b = result['badges'][i];
                allBadges[b['id']] = b;
                var url = b['imageURL'].replace(/^\/static/, "../static");
                var clazz = 'earnedBadge';
                if (url && !b['awarded']) {
                    url = url.replace('_on', '_off');
                    clazz = 'notEarnedBadge';
                }
                var html = '<img src="'+url+'" class="'+clazz+'" alt="Badge" title="'+b['description']+'" '+
                    'onclick="selBadge(this, '+b['id']+', ';
                if (str(b['class']).indexOf('Level_Badge') >= 0) {
                    if (prevBadge && prevBadge['path_id'] != b['path_id']) {
                        levelBadges += '<br>';
                    }
                    levelBadges += html + '1)"/>';
                    prevBadge = b;
                } else if (str(b['class']).indexOf('CountryBadge') >= 0) {
                    countryBadges += html + '2)"/>';
                } else {
                    otherBadges += html + '3)"/>';
                }
            }
            $('#yourPathBadgesBox').html(levelBadges);
            $('#yourCountryBadgesBoxTop').html(countryBadges);
            $('#yourBadgesBoxTop').html(otherBadges);
        }
    });
}
function selBadge(element, badge_id, type) {
    var badge = allBadges[badge_id];
    var s = '';
    var div1 = '';
    var div2 = '';
    if (type == 1) {
        s = '#yourPathBadgesBox';
        showLevelBadgeChain(badge);
    } else if (type == 2) {
        s = '#yourCountryBadgesBoxTop';
        div1 = '#yourCountryBadgesBoxBottom1';
        div2 = '#yourCountryBadgesBoxBottom2';
    } else {
        s = '#yourBadgesBoxTop';
        div1 = '#yourBadgesBoxBottom1';
        div2 = '#yourBadgesBoxBottom2';
    }
    $(s+' img').removeClass('selectedBadge');
    if (div1) {
        $(div1).html('<img src="'+badge['imageURL'].replace(/^\/static/, "../static")+'" title="'+badge['description']+'"/>')
    }
    if (div2) {
        $(div2).html('<b>'+badge['description']+'</b><br>'+badge['badgeInformation'])
    }
    $(element).addClass('selectedBadge');
}
function showLevelBadgeChain(badge) {
    $('#badge2').html('<img src="'+badge['imageURL'].replace(/^\/static/, "../static")+'" title="'+badge['description']+'"/>');

    var img = '';
    for (var i in badge.requiredBadges) {
        var badge_id = badge.requiredBadges[i];
        var b = allBadges[badge_id];
        img += '<img src="'+b['imageURL'].replace(/^\/static/, "../static")+'" title="'+b['description']+'"/>';
    }
    $('#badge1').html(img);

    //loop through all badges and find a badge where the current badge is a required badge
    img = '';
    for (var i in allBadges) {
        var b = allBadges[i];
        for (var j in b.requiredBadges) {
            var rb = b.requiredBadges[j];
            if (rb == badge.id) {
                img = '<img src="'+b['imageURL'].replace(/^\/static/, "../static")+'" title="'+b['description']+'"/>';
                break;
            }
        }
    }
    $('#badge3').html(img);
}
$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    log_access('badges');
    loadPlayerData();
    loadBadges();
});
