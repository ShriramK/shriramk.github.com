var interfaces=[];
var badgesById = {}
var countriesById = {}
var current_player_id = 0;
var myPathsById = {};

$(document).ready(function() {
    $("div#loading").ajaxStart(function() {
        $("div#loading").show();
    });
    $("div#loading").ajaxStop(function() {
        $("div#loading").hide();
    });
    
    // Ivan, Note: Function was updated in LogAccessCtrl():controllers.js
    // log_access('home');
    
    loadPlayerData(function(result) {
        current_player_id = result['player_id'];
    });
    autoPreloadRollsImages();
    loadBadges();
    loadRankingData(undefined, function(rankings){
      if (rankings['path_id']) {
        $('#rankingLink').attr('href', 'ranking.html?path_id='+rankings['path_id'])
      }
      if (rankings['interface_id']) {
        $('#interface_id').val(rankings['interface_id']);
        ajax({
            url: '../jsonapi/interfaces',
            success: function(result) {
                interfaces = result.interfaces;
                loadMyPaths();
            }
        });
      }
    });
    ajax({
        url: '../jsonapi/get_current_paths',
        success: function(result) {
            var paths = result.paths;
            loadPathsData(paths, 'levels');
            ajax({
                url: '../jsonapi/get_other_paths',
                success: function(result) {
                    var current_paths = {};
                    for (var j in paths) {
                        current_paths[paths[j]['id']] = 1;
                    }
                    var other_paths = [];
                    for (var i in result.paths) {
                        var path = result.paths[i];
                        if (!current_paths[path['id']]) {
                            other_paths.push(path);
                        }
                    }
                    loadPathsData(other_paths, 'otherPaths');
                }
            });
        }
    });
    // badges data
    ajax({
        url: '../jsonapi/badges_for_current_player/10030',
        success: function(badges) {
            var html = '';
            var foundFirstLevelBadge = false;
            var highestBadges = getHighestBadges(badges.badges);
            var onlyHighest = {LevelCreatorBadge: 1, TeacherBadge: 1}
            for(var i in badges.badges) {
                var b = badges.badges[i];
                var clazz = b['class'][b['class'].length - 1];
                if (!foundFirstLevelBadge) {
                    if (clazz == 'Level_Badge') {
                        foundFirstLevelBadge = true;
                        html += '<br/>';
                    }
                }
                if (!onlyHighest[clazz] || b['awardOrder'] == highestBadges[clazz]) {
                    html += createBadge(b.imageURL, b.description);
                }
            }
            $('#hbBadgesZone').html(html);
        }
    });
});
function getHighestBadges(badges) {
    var h = {};
    for (var i in badges) {
        var b = badges[i];
        var clazz = b['class'][b['class'].length - 1];
        if (h[clazz]) {
            h[clazz] = Math.max(h[clazz], b['awardOrder']);
        } else {
            h[clazz] = b['awardOrder'];
        }
    }
    return h;
}
function getCallbackForGetPathProgess(elementId, myPaths, orig_path) {
    return function(progInfo) {
        var totProb = progInfo.problemsInPath;
        var totCurrPlProg = progInfo.currentPlayerProgress;
        //jQuery("#hpTopRankingDetails").html(totProb);
        var path = progInfo['path'];
        var cpLevelButton = '';
        var dtls;
        if (myPaths) {
            for (var idx in interfaces) {
                var ii = interfaces[idx];
                if (ii.id == orig_path.interface_id) {
                    cpLevelButton = '<span class="emptySmallButton">'+ii.name+'</span>';
                    break;
                }
            }
            dtls = path.name;
        } else {
            cpLevelButton = '<span class="emptyButton">'+path.name+'</span>';
            dtls = totCurrPlProg+"/"+totProb;
        }
        var html =
            '<td class="cpLevel'+(myPaths ? 'Smaller' : '')+'Button"><a href="levels.html?path_id='+
                path.id+'" class="rolls" title="'+path.name+'">'+cpLevelButton+'</a></td>' +
            '<td class="cpDetails'+(myPaths ? 'Smaller' : '')+'">' + dtls + '</td>' +
            '<td class="cpRunPath'+(myPaths ? 'Smaller' : '')+'Button"><div><a href="javascript:" '+
                'onclick="runPaths('+path.id+', 0)" class="rolls"><img src="_images/homePageButtons/runPath'+
                (myPaths ? 'Smaller' : '')+'_off.png" alt="Run The Path" class="cpRunPath'+
                (myPaths ? 'Smaller' : '')+'Button" /></a></div>';
        if (myPaths) {
            html += '<div class="editpath editpathhidden">'+
                '<img class="rolls editpath" '+
                '    src="_images/commonButtons/editCircle_off.png" title="Edit this path" '+
                '    onclick="showEditPathPopup('+path.id+')"/>'+
                '<img class="rolls deletepath" '+
                '    src="_images/commonButtons/deleteCircle_off.png" title="Delete this path" '+
                '    onclick=""/>'+
                '</div>';
        }
        html += '</td>';
        $("#"+elementId+"_tr_"+path.id).html(html);
        initRolls();
        autoPreloadRollsImages();
        preloadImages(['_images/commonButtons/blankPathButton_on.png']);
    }
}
function loadPathsData(paths, elementId, myPaths) {
    $("#"+elementId).empty();
    var i;
    for (i in paths) {
        var path = paths[i];
        var html = 
            '<tr class="cpLevelButton" id="'+elementId+'_tr_'+path.id+'">'+
            '</tr>'+
            '<tr class="horizontalLine">'+
              '<td class="horizontalLine" colspan="3"></td>'+
            '</tr>';
        $("#"+elementId).append(html);
    }
    if (myPaths) {
        html =
            '<tr>'+
              '<td colspan="3" style="text-align: center">'+
                '<img class="rolls" src="_images/commonButtons/addEditDetails_off.png" onclick="showEditPaths()">'+
              '</td>'+
            '</tr>';
        $("#"+elementId).append(html);
    }
    for (i in paths) {
        var orig_path = paths[i];
        ajax({
            url: '../jsonapi/get_path_progress/' + orig_path.id,
            success: getCallbackForGetPathProgess(elementId, myPaths, orig_path)
        });
    }
}
function editDetails() {
    showProfileEditPopup();
}
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
    _showTab($('table.homeCurrentPath table.tabHeader td')[0], index, 'div.levels', 'div.myPaths', 'div.otherPaths');
}
function loadMyPaths() {
//    var interface_id = $('#interface_id').val();
    ajax({
        url: '../jsonapi/get_my_paths', //no need for interface_id, we need all of my paths
        success: function(result) {
            var paths = result.paths;
            if (paths && paths.length > 0) {
                loadPathsData(paths, 'myPaths', true);
            } else {
                var msg = '<tr><td class="cpNoPaths">You have no paths.<br/>Please use the button below '+
                    'to create your own paths and problems.</td></tr>';
                $("#myPaths").empty();
                $("#myPaths").append(msg);
            }
            myPathsById = {};
            for (var i in paths) {
                myPathsById[paths[i].id] = paths[i];
            }
        }
    });
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

            //after we have elements in the selects, we can download challenges list
            loadChallenges();
        }
    });
}
function loadBadges() {
    ajax({
        url: '../jsonapi/all_badges',
        success: function(result) {
            for (var i in result['badges']) {
                var b = result['badges'][i];
                badgesById[b['id']] = b;
            }

            loadCountries();
        }
    });
}
function loadChallenges() {
    ajax({
        url: '../jsonapi/list_challenges',
        success: function(result) {
            $('#hpChallenges').empty();
            var html = '<table class="hpChallenge">';
            if (result['challenges']) {
                for (var ci in result['challenges']) {
                    var ch = result['challenges'][ci];
                    
                    var badges = [];
                    if (!ch['_playerRegistered']) {
                        badges = ch['registeredRequiredBadges'];
                    } else {
                        badges = ch['unlockRequiredBadges'];
                    }
                    for (var i in badges) {
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
                    for (var j in badges) {
                        var b = badges[j];
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
                    var lockImage = '';
                    if (ch['_playerUnlocked'] == true) {
                        lockImage = 'privateButtonUnlocked_on.png';
                    } else {
                        lockImage = 'privateButtonLocked_on.png';
                    }
                    if (ch['_playerRegistered'] && !ch['_playerSubmitted']) {
                        html +=
                            '<tr>'+
                              '<td class="name"><a href="/challenge/'+ch['challenge_id']+'">'+ch['name']+'</a></td>'+
                              '<td class="location">'+location+'</td>'+
                              '<td class="needed">'+badges+'</td>'+
                              '<td class="locked"><img src="_images/commonButtons/'+lockImage+'"/></td>'+
                            '</tr>';
                    }
                }
            }
            html += '</table>';

            $('#hpChallenges').append(html);
        }
    });
}
function showEditPaths() {
    if ($('table#myPaths').attr('class') == 'levels') {
        $('table#myPaths').attr('class', 'levelsEdit');
    } else {
        $('table#myPaths').attr('class', 'levels');
    }
}
function showEditPathPopup(path_id) {
    var path = myPathsById[path_id];
    if (path) {
        var iface = {'name': ''};
        for (var i in interfaces) {
            if (interfaces[i].id == path.interface_id) {
                iface = interfaces[i];
                break;
            }
        }
        $('div#popup_path_language').html(iface.name);
        $('#popup_path_name').val(path.name);
        $('#popup_path_desc').val(path.description);
        $('#popup_save_button').unbind('click');
        $('#popup_save_button').click(
            (function(id){
                return function(){
                    savePath(id);
                };
            })(path_id)
        );
        $('#showProfilePopup').show();
    }
}
function savePath(path_id) {
    var data = {
        'path_id': path_id,
        'name': $('#popup_path_name').val(),
        'description': $('#popup_path_desc').val()
    };
    ajax({
        url: '../jsonapi/edit_path',
        data: data,
        success: function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
            alert('Path successfully modified!');
            $('#showProfilePopup').hide();
            loadMyPaths();
        }
    });
}
